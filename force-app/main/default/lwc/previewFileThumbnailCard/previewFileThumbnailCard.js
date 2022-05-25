import { LightningElement, api } from "lwc";
import haveDisplayUrl from "@salesforce/apex/fileController.haveDisplayUrl";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import MS_error_selecting_profile from '@salesforce/label/c.MS_error_selecting_profile';


export default class PreviewFileThumbnailCard extends LightningElement {
  isMain = false;
  @api file;
  @api recordId;
  @api thumbnail;

  get iconName() {
    this.chekForMain();
    if (this.file.Extension) {
      if (this.file.Extension === "pdf") {
        return "doctype:pdf";
      }
      if (this.file.Extension === "ppt") {
        return "doctype:ppt";
      }
      if (this.file.Extension === "xls") {
        return "doctype:excel";
      }
      if (this.file.Extension === "csv") {
        return "doctype:csv";
      }
      if (this.file.Extension === "txt") {
        return "doctype:txt";
      }
      if (this.file.Extension === "xml") {
        return "doctype:xml";
      }
      if (this.file.Extension === "doc") {
        return "doctype:word";
      }
      if (this.file.Extension === "zip") {
        return "doctype:zip";
      }
      if (this.file.Extension === "rtf") {
        return "doctype:rtf";
      }
      if (this.file.Extension === "psd") {
        return "doctype:psd";
      }
      if (this.file.Extension === "html") {
        return "doctype:html";
      }
      if (this.file.Extension === "gdoc") {
        return "doctype:gdoc";
      }
    }
    return "doctype:image";
  }

  chekForMain(){
    haveDisplayUrl({recordId: this.recordId, url: this.thumbnail})
    .then(result=> {
        this.isMain = result;
    })
    .catch(error => {
      this.dispatchEvent(
          new ShowToastEvent({
              title: MS_error_selecting_profile,
              message: error.body.message,
              variant: 'error'
          })
      );
  });
  }

  filePreview(){
    const showPreview = this.template.querySelector("c-preview-file-modal");
    showPreview.show();
  }
}