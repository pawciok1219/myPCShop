import { LightningElement, wire, api, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getFileVersions from "@salesforce/apex/fileController.getVersionFiles";
import MS_error_loading_files from '@salesforce/label/c.MS_error_loading_files';

export default class PreviewFileThumbnails extends LightningElement {
  loaded = false;
  @track fileList;
  @api recordId;
  @track files = [];
  get acceptedFormats() {
    return [".png", ".jpg", ".jpeg"];
  }

  @wire(getFileVersions, { recordId: "$recordId" })
  fileResponse(value) {
    this.wiredActivities = value;
    const { data, error } = value;
    this.fileList = "";
    this.files = [];
    if (data) {
      this.fileList = data;
      for (let i = 0; i < this.fileList.length; i++) {
        let file = {
          Id: this.fileList[i].Id,
          Title: this.fileList[i].Title,
          Extension: this.fileList[i].FileExtension,
          ContentDocumentId: this.fileList[i].ContentDocumentId,
          ContentDocument: this.fileList[i].ContentDocument,
          CreatedDate: this.fileList[i].CreatedDate,
          thumbnailFileCard:
            "/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480&versionId=" +
            this.fileList[i].Id +
            "&operationContext=CHATTER&contentId=" +
            this.fileList[i].ContentDocumentId,
            downloadUrl:
            "/sfc/servlet.shepherd/document/download/" +
            this.fileList[i].ContentDocumentId
        };
        this.files.push(file);
      }
      this.loaded = true;
    } else if (error) {
      this.dispatchEvent(
        new ShowToastEvent({
          title: MS_error_loading_files,
          message: error.body.message,
          variant: "error"
        })
      );
    }
   
  }
}