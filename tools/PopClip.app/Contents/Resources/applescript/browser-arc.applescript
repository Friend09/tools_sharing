-- #popclip
-- name: arc
-- language: applescript
-- placeholder: company.thebrowser.Browser

on getFrontmostUrl()
	tell application id "company.thebrowser.Browser"
		get the URL of active tab of front window
	end tell
end getFrontmostUrl

on getFrontmostTitle()
	tell application id "company.thebrowser.Browser"
		get the title of active tab of front window
	end tell
end getFrontmostTitle

--on openTab(theUrl, background)
--	tell application id "company.thebrowser.Browser"
--		tell front window
--			set activeTabId to id of active tab
--			make new tab with properties {URL:theUrl}
--			if background then
--				tell tab id activeTabId to select
--			end if
--		end tell
--	end tell
--end openTab
