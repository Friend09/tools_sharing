-- #popclip
-- name: chromium
-- language: applescript
-- placeholder: com.google.Chrome

on getFrontmostUrl()
	tell front window of application id "com.google.Chrome"
		get URL of active tab
	end tell
end getFrontmostUrl

on getFrontmostTitle()
	tell front window of application id "com.google.Chrome"
		get title of active tab
	end tell
end getFrontmostTitle

on openTab(theUrl, background)
	tell front window of application id "com.google.Chrome"
		set activeTabIndex to active tab index
		set newTab to make new tab with properties {URL: theUrl}
		if background then
			set active tab index to activeTabIndex
		end if
	end tell
end openTab