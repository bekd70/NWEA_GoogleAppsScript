/**********
 * This script downloads any files that are saved  through
 * the NWEA Data Export Scheduler.  The Script downloads the zip zile
 * un-zips it and saves any csv files that has more than 1 row to Google Drive.
 * It will then add the name(s) of the file(s), link, and date added to a spreadsheet.  
 * An email is sent to the user notifiy them of the downloaded file.
 * 
 * If the archive only has file with the header rows in them, it will not save them 
 * nor send and email notification.
 * 
 * You will need to set up a daily export of either the Comprehensive Data File
 * or the Combined Data File in the NWEA Data Export Scheduler. A daily trigger will need
 * to be set up on the script to run.
 * 
 * The NWEA user account must have atleast Data Administrator privileges in NWEA.
 * You will have to wait 24 hours after giving the user Data Administrator 
 * privileges before this script will work.
 * 
 * This was create by Bob Elliott and is released under the CC BY-NC-SA 4.0 
 * (https://creativecommons.org/licenses/by-nc-sa/4.0/)
 */

function getData() {
  //add you speadsheet ID
  let ss = SpreadsheetApp.openById('SPREADSHEETID_HERE')
  //add you sheet name
  let sheet = ss.getSheetByName('SHEET_NAME_HERE')
  let url = "https://api.mapnwea.org/services/reporting/dex"
  //email associated with NWEA account that has Data Administer privileges
  let user = "USER@DOMAIN.COM";
  //NWEA password
  let password = "PASSWORD";
  //folder ID for where you would like to store the files
  let folderId = 'YOUR_GOOGLE_FOLDER_ID';
  let fileUrls = [];
  //this will stay false unless any of the files have more that the header rows in them
  let sendEmail = false;

  let auth = {"Authorization": "Basic " + Utilities.base64Encode(user + ":" + password)};
  
  let options = {
    'method' : 'get',
    'headers' : auth,
    'muteHttpExceptions': true,
    "Accept": "application/a-gzip",
    'validateHttpsCertificates' : true
  };
  try{
    let response = UrlFetchApp.fetch(url, options);
    let responseCode = response.getResponseCode();

    if(responseCode<300){
      let nweaData = response.getBlob();
      let contentType = nweaData.getContentType();
      let unzippedFile = Utilities.unzip(nweaData);
      for(let i = 0;i<unzippedFile.length;i++){
        let filename = `${Utilities.formatDate(new Date,"IST","YYYY-MM-dd_HHmm")}-${unzippedFile[i].getName()}`;
        let csv = unzippedFile[i];
        var file = {
          title: filename,
          mimeType: contentType
        };
        let csvData = Utilities.parseCsv(csv.getDataAsString());
        if (csvData.length>1){
          let newFile = DriveApp.createFile(csv).setName(file.title);
          let fileId = newFile.getId();
          console.log('ID: %s, File size (bytes): %s', fileId, newFile.getSize());
          
          let folder = DriveApp.getFolderById(folderId);
          let driveFile = DriveApp.getFileById(fileId);
          folder.addFile(driveFile);
          let link = driveFile.getUrl()
          fileUrls.push([link,file.title,Utilities.formatDate(new Date,"IST","YYYY-MM-dd")])
          sendEmail = true;
          
        }
        else{
          console.log("The file was empty.")
        }
      }
      if(sendEmail){
        let body = `There were ${fileUrls.length} file(s) uploaded from NWEA and saved to:<br>:<ul>`
        for(let i=0;i<fileUrls.length;i++){
          body = body + `<li><a href='${fileUrls[i][0]}'>${fileUrls[i][1]}</a> on ${Utilities.formatDate(new Date,"IST","YYYY-MM-dd")}</li>`
        }
        body = body + '</ul>'
        GmailApp.sendEmail(user,"A New NWEA File was uploaded",body,{
        htmlBody: body
        });
        sheet.getRange(sheet.getLastRow()+1,1,fileUrls.length,fileUrls[0].length).setValues(fileUrls)
      }
    }
    else{
      let body = `The Response Code from NWEA was ${responseCode} and the error was ${JSON.stringify(response.getContentText())}`
      let subject = 'There was a problem getting the new file from NWEA';
      GmailApp.sendEmail(user,subject,body,{
        htmlBody: body
      });
      console.log(`The Response Code was ${responseCode} and the error was ${JSON.stringify(response.getContentText())}`);
    }
  }
  catch(e){
    console.log(`There was an error: ${JSON.stringify(e)}`)
  }
}

