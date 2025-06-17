# Databricks to Corporate SQL Server Connectivity Guide

Since FreeTDS with tsql worked on your Mac, the underlying SQL Server authentication and connectivity are confirmed. Connecting from Databricks involves **cloud-to-on-premises networking** and **scalable authentication** - different challenges than local connectivity.

## Network connectivity requirements (Critical first step)

**Test basic connectivity from Databricks:**
```python
%sh
# Test if your SQL Server is reachable from Databricks
nc -zv your-sql-server.company.com 1433
```

If this fails, you need one of these network solutions:
- **VPN connection** between Databricks VPC and corporate network
- **AWS Direct Connect** or **Azure ExpressRoute** for dedicated connectivity  
- **Public IP access** with proper firewall rules (not recommended for production)

## Method 1: jTDS Driver with Domain Authentication (Recommended)

Since FreeTDS worked, jTDS should be your best path forward. It handles Windows authentication better than Microsoft drivers in cloud environments.

### Install jTDS driver on cluster
Add this as a **cluster library** (Maven coordinates):
```
net.sourceforge.jtds:jtds:1.3.1
```

### Python connection code using jTDS
```python
import jaydebeapi

# jTDS connection using domain credentials
jdbcHostname = "your-sql-server.company.com"
jdbcPort = 1433
jdbcDatabase = "your-database"
domain = "YOURDOMAIN"
username = "your-username"  # without domain prefix
password = "your-password"

# jTDS connection string with Windows authentication
jdbcUrl = f"jdbc:jtds:sqlserver://{jdbcHostname}:{jdbcPort}/{jdbcDatabase};useNTLMv2=true;domain={domain};"

# Connection properties
connectionProperties = {
    "user": username,
    "password": password,
    "driver": "net.sourceforge.jtds.jdbc.Driver"
}

# Read data using Spark
df = spark.read.jdbc(
    url=jdbcUrl, 
    table="(SELECT * FROM your_table) alias",
    properties=connectionProperties
)

df.show()
```

### Alternative: Scala with jTDS
```scala
import java.util.Properties

val jdbcHostname = "your-sql-server.company.com"
val jdbcPort = 1433
val jdbcDatabase = "your-database"
val domain = "YOURDOMAIN"
val username = "your-username"
val password = "your-password"

val jdbcUrl = s"jdbc:jtds:sqlserver://${jdbcHostname}:${jdbcPort}/${jdbcDatabase};useNTLMv2=true;domain=${domain};"

val connectionProperties = new Properties()
connectionProperties.put("user", username)
connectionProperties.put("password", password)
connectionProperties.setProperty("driver", "net.sourceforge.jtds.jdbc.Driver")

val df = spark.read.jdbc(jdbcUrl, "(SELECT * FROM your_table) alias", connectionProperties)
df.show()
```

## Method 2: Microsoft ODBC Driver with pyodbc

### Install ODBC drivers via init script
Create an **init script** to install required drivers:

```bash
#!/bin/bash
# Save as: /Volumes/catalog/schema/volume/install-sqlserver-drivers.sh

# Install unixODBC and dependencies
sudo apt-get update
sudo apt-get -q -y install unixodbc unixodbc-dev
sudo apt-get -q -y install python3-dev

# Install Microsoft ODBC Driver 18 for SQL Server
curl https://packages.microsoft.com/keys/microsoft.asc | sudo tee /etc/apt/trusted.gpg.d/microsoft.asc
curl https://packages.microsoft.com/config/ubuntu/20.04/prod.list | sudo tee /etc/apt/sources.list.d/mssql-release.list
sudo apt-get update
sudo ACCEPT_EULA=Y apt-get -q -y install msodbcsql18

# Install pyodbc
pip install pyodbc
```

Add this script to your cluster in **Advanced Options > Init Scripts**.

### Python connection using pyodbc
```python
import pyodbc

server = 'your-sql-server.company.com'
database = 'your-database'
username = 'YOURDOMAIN\\your-username'
password = 'your-password'

# Connection string for Windows authentication
conn_str = (
    f'DRIVER={{ODBC Driver 18 for SQL Server}};'
    f'SERVER={server};'
    f'DATABASE={database};'
    f'UID={username};'
    f'PWD={password};'
    f'Encrypt=yes;'
    f'TrustServerCertificate=yes;'
)

try:
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    cursor.execute("SELECT TOP 10 * FROM your_table")
    
    for row in cursor:
        print(row)
        
except Exception as e:
    print(f"Error: {e}")
```

## Method 3: SQL Server Authentication (Simplest)

If Windows authentication proves challenging, switch to SQL Server authentication:

### Enable mixed-mode authentication on SQL Server
Work with your DBAs to:
1. Enable **Mixed Mode Authentication** on SQL Server
2. Create dedicated SQL login for Databricks: `CREATE LOGIN databricks_user WITH PASSWORD = 'strong_password'`
3. Grant appropriate permissions: `ALTER SERVER ROLE db_datareader ADD MEMBER databricks_user`

### Python connection code
```python
# SQL Server authentication (much simpler)
jdbcHostname = "your-sql-server.company.com"
jdbcPort = 1433
jdbcDatabase = "your-database"
username = "databricks_user"
password = "strong_password"

jdbcUrl = f"jdbc:sqlserver://{jdbcHostname}:{jdbcPort};databaseName={jdbcDatabase};encrypt=true;trustServerCertificate=true;"

connectionProperties = {
    "user": username,
    "password": password,
    "driver": "com.microsoft.sqlserver.jdbc.SQLServerDriver"
}

df = spark.read.jdbc(
    url=jdbcUrl,
    table="your_table", 
    properties=connectionProperties
)

df.show()
```

## Method 4: Service Principal Authentication (Enterprise)

For production environments, use Azure AD service principals:

### Setup service principal
```python
# First, create service principal and configure in Azure AD
# Then use it in Databricks

server = "your-sql-server.company.com"
database = "your-database"
client_id = "your-service-principal-id"
client_secret = "your-service-principal-secret"
tenant_id = "your-tenant-id"

connection_string = (
    f"jdbc:sqlserver://{server}:1433;"
    f"database={database};"
    f"authentication=ActiveDirectoryServicePrincipal;"
    f"user={client_id};"
    f"password={client_secret};"
    f"tenant={tenant_id};"
    f"encrypt=true;"
    f"trustServerCertificate=true;"
)

df = spark.read.jdbc(
    url=connection_string,
    table="your_table",
    properties={"driver": "com.microsoft.sqlserver.jdbc.SQLServerDriver"}
)
```

## Credential Management Best Practices

### Use Databricks Secrets
Never hardcode credentials in notebooks:

```python
# Store credentials in Databricks secrets
username = dbutils.secrets.get(scope="sql-server", key="username")
password = dbutils.secrets.get(scope="sql-server", key="password")

# Use in connection
connectionProperties = {
    "user": username,
    "password": password,
    "driver": "net.sourceforge.jtds.jdbc.Driver"
}
```

### Create secret scope
```bash
# Using Databricks CLI
databricks secrets create-scope --scope sql-server
databricks secrets put --scope sql-server --key username
databricks secrets put --scope sql-server --key password
```

## Advanced Configuration Options

### Connection pooling and performance
```python
# For high-throughput scenarios
connectionProperties = {
    "user": username,
    "password": password,
    "driver": "net.sourceforge.jtds.jdbc.Driver",
    "numPartitions": "8",  # Parallel connections
    "fetchsize": "10000",  # Larger fetch size
    "prepareThreshold": "3",  # Prepared statements
}

# Partition for parallel reads
df = spark.read.jdbc(
    url=jdbcUrl,
    table="your_table",
    properties=connectionProperties,
    column="id",  # Partition column
    lowerBound=1,
    upperBound=1000000,
    numPartitions=8
)
```

### Custom timeout settings
```python
# Handle network timeouts in corporate environment
connectionProperties = {
    "user": username,
    "password": password,
    "driver": "net.sourceforge.jtds.jdbc.Driver",
    "loginTimeout": "30",
    "socketTimeout": "30000",
    "connectTimeout": "30000",
}
```

## Troubleshooting Common Issues

### "Connection timed out" errors
```python
# Test connectivity first
%sh
ping your-sql-server.company.com
nc -zv your-sql-server.company.com 1433
nslookup your-sql-server.company.com
```

**Solutions:**
- Verify VPN/Direct Connect is established
- Check corporate firewall allows Databricks IPs
- Ensure SQL Server is listening on TCP/IP (not just named pipes)

### "Login failed" or authentication errors
```python
# Test with SQL authentication first
connectionProperties = {
    "user": "sa",  # or known SQL user
    "password": "sql_password",
    "driver": "com.microsoft.sqlserver.jdbc.SQLServerDriver"
}
```

**Solutions:**
- Verify domain\username format for Windows auth
- Check if account is locked or password expired
- Confirm SQL Server allows your authentication method

### Driver not found errors
```bash
# Check installed drivers
%sh
odbcinst -q -d
```

**Solutions:**
- Verify init script ran successfully
- Restart cluster after installing drivers
- Check library installation in cluster UI

## Production Deployment Recommendations

### Network architecture
1. **Establish dedicated connectivity**: VPN or Direct Connect
2. **Use private subnets**: Deploy Databricks in private subnets
3. **Configure route tables**: Ensure proper routing to on-premises

### Security hardening
1. **Service accounts**: Create dedicated SQL Server accounts for Databricks
2. **Principle of least privilege**: Grant only necessary permissions
3. **Network segmentation**: Restrict access to specific Databricks IPs
4. **Audit logging**: Enable SQL Server audit for Databricks connections

### Performance optimization
1. **Connection pooling**: Use appropriate pool sizes
2. **Query optimization**: Leverage partitioning and predicate pushdown
3. **Data staging**: Consider staging data in cloud storage for better performance
4. **Incremental loading**: Use change data capture (CDC) for large datasets

### Monitoring and alerting
```python
# Connection health check
def test_sql_connection():
    try:
        df = spark.read.jdbc(
            url=jdbcUrl,
            table="(SELECT 1 as test_col) alias",
            properties=connectionProperties
        )
        return df.count() == 1
    except Exception as e:
        print(f"Connection failed: {e}")
        return False

# Run in scheduled job
if not test_sql_connection():
    raise Exception("SQL Server connection failed - check network and credentials")
```

## Next Steps

1. **Test basic connectivity** with `nc -zv` command
2. **Start with jTDS method** since FreeTDS worked for you
3. **Create init script** for driver installation
4. **Set up secrets** for credential management
5. **Test with simple query** before complex operations
6. **Work with network team** if connectivity fails

The key difference from your Mac setup is that Databricks runs in a cloud VPC and needs network connectivity to reach your corporate SQL Server. Once that's established, the jTDS driver approach should work similarly to your FreeTDS success.