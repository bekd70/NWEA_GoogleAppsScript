# NWEA_GoogleAppsScript
This script downloads any files that are saved  through
the NWEA Data Export Scheduler.  The Script downloads the zip zile
un-zips it and saves any csv files that has more than 1 row to Google Drive.
It will then add the name(s) of the file(s), link, and date added to a spreadsheet.  
An email is sent to the user notifiy them of the downloaded file.
 
If the archive only has file with the header rows in them (i.e. no student testing data),
it will not save them nor send and email notification.
 
You will need to set up a daily export of either the Comprehensive Data File
or the Combined Data File in the NWEA Data Export Scheduler. A daily trigger will need
to be set up on the script to run.
 
The NWEA user account must have atleast Data Administrator privileges in NWEA.
You will have to wait 24 hours after giving the user Data Administrator 
privileges before this script will work.
 
This was create by Bob Elliott and is released under the CC BY-NC-SA 4.0 
(https://creativecommons.org/licenses/by-nc-sa/4.0/)

