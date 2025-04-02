-- #popclip
-- name: safari
-- language: applescript
-- placeholder: com.apple.Safari

on getFrontmostUrl()
	tell application id "com.apple.Safari"
		get URL of current tab of window 1
	end tell
end getFrontmostUrl

on getFrontmostTitle()
	tell application id "com.apple.Safari"
		get name of current tab of window 1
	end tell
end getFrontmostTitle

on openTab(theUrl, background)
	tell front window of application id "com.apple.Safari"
		set newTab to make new tab with properties {URL: theUrl}
		if (not background) then
			set the current tab to newTab
		end if
	end tell
end openTab
