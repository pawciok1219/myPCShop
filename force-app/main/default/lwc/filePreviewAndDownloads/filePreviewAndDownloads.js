import { LightningElement, api, wire, track } from 'lwc';
import getRelatedFilesByRecordId from '@salesforce/apex/MS_FilePreviewAndDownloadController.getRelatedFilesByRecordId';
import deleteContentDocument from '@salesforce/apex/MS_FilePreviewAndDownloadController.deleteContentDocument';
import updateDisplayURL from '@salesforce/apex/MS_FilePreviewAndDownloadController.updateDisplayURL';
import deleteAllFilesByRecordId from '@salesforce/apex/MS_FilePreviewAndDownloadController.deleteAllFilesByRecordId';
import getContentDownloadUrl from '@salesforce/apex/MS_ContentDistributionLinks.getContentDownloadUrl';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from "@salesforce/apex";
import {NavigationMixin} from 'lightning/navigation';
import { getRecord, getFieldValue} from 'lightning/uiRecordApi';
import DISPLAYURL_FIELD from '@salesforce/schema/Product2.DisplayUrl';
import MS_error_selecting_profile from '@salesforce/label/c.MS_error_selecting_profile';
import MS_error_deleting_file from '@salesforce/label/c.MS_error_deleting_file';
import MS_files_uploaded from '@salesforce/label/c.MS_files_uploaded';
import MS_upload_product_images from '@salesforce/label/c.MS_upload_product_images';
import MS_close from '@salesforce/label/c.MS_close';
import MS_file_preview_big from '@salesforce/label/c.MS_file_preview_big';
import MS_file_name from '@salesforce/label/c.MS_file_name';
import MS_profile_image from '@salesforce/label/c.MS_profile_image';
import MS_preview from '@salesforce/label/c.MS_preview';
import MS_delete from '@salesforce/label/c.MS_delete';
import MS_cancel from '@salesforce/label/c.MS_cancel';
import MS_save_and_new from '@salesforce/label/c.MS_save_and_new';
import MS_save from '@salesforce/label/c.MS_save';

const fields = [DISPLAYURL_FIELD];


export default class FilePreviewAndDownloads extends NavigationMixin(LightningElement) {

    label = {
        MS_upload_product_images,
        MS_close,
        MS_file_preview_big,
        MS_file_name,
        MS_profile_image,
        MS_preview,
        MS_delete,
        MS_cancel,
        MS_save_and_new,
        MS_save
    };

    @api recordId;
    @track isModalOpen = true;
    @track filesList = [];
    wiredActivities;
    acceptedFormats = '.png,.jpg,.jpeg';
    @wire(getRelatedFilesByRecordId, {recordId: '$recordId'})
    wiredResult(result){ 
       const { data, error } = result;
       this.wiredActivities = result;
       if(data){ 
           Promise.all( Object.keys(data).map( async item=>{
               this.contentVersionId = data[item].Id;
               const publicUrl = await this.displayUrlConverted();
               const temp =  {
                   "label":data[item].Title,
                    "value": data[item].ContentDocumentId,
                    "converturl":  publicUrl,
                    "imageurl":`/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480&versionId=${data[item].Id}&operationContext=CHATTER&contentId=${data[item].ContentDocumentId}`,
                    "fileextension": data[item].FileExtension,
                    "isProfileImage": this.isProfileImageCheck(publicUrl)
                   }
                   return temp;
            })).then((result) => {
               this.filesList = result;
            })
       }
       if(error){ 
           this.dispatchEvent(
               new ShowToastEvent({
                   title: MS_Error_Load_File,
                   message: error.body.message,
                   variant: 'error',
               }),
           );
       }
   }

   displayUrlConverted(){
    return new Promise( (resolutionFunc,rejectionFunc) => {
        getContentDownloadUrl({contentVersionId: this.contentVersionId})
        .then(result => {
            resolutionFunc(result);
        });
        }); 
    }

    @wire(getRecord, { recordId: '$recordId', fields })
    product;

    get displayurl() {
        return getFieldValue(this.product.data, DISPLAYURL_FIELD);
    }
    
    isProfileImageCheck(url) {
        if(url == this.displayurl) {
            return true;
        }else {
            return false;
        }
    }

    handleCheckBoxChange(event){
        if(event.target.checked){
            let url = event.target.value;
            updateDisplayURL({ recordId: this.recordId, url: event.target.value})
            .then(result => {
                let selected = [...this.template.querySelectorAll('lightning-input')].filter(input => input.value != url);
                selected.forEach(element => element.checked=false)
                refreshApex(this.displayurl);
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
        } else {
            updateDisplayURL({ recordId: this.recordId, url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/330px-No-Image-Placeholder.svg.png'})
            .then(result => {
                refreshApex(this.wiredActivities);
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error!',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });
        }
    }

    handleDeleteFiles(event) {
        const Id = event.target.dataset.id;
        const url = event.target.value;
        refreshApex(this.product);
        deleteContentDocument({
            recordId: Id
        })
        .then(result => {
            refreshApex(this.wiredActivities);
            if(url == this.displayurl){
                updateDisplayURL({ recordId: this.recordId, url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/330px-No-Image-Placeholder.svg.png'})
                .then(result => {
                    refreshApex(this.wiredActivities);
                })
                .catch(error => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error!',
                            message: error.body.message,
                            variant: 'error'
                        })
                    );
                });
            }
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: MS_error_deleting_file,
                    message: error.body.message,
                    variant: 'error'
                })
            );
        })
    }

    openModal() {
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
    }

    handleUploadFinished(event) {
        const uploadedFiles = event.detail.files;
        refreshApex(this.wiredActivities);
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success!",
            message: uploadedFiles.length +" "+MS_files_uploaded,
            variant: "success"
          })
        );

    }

    previewImage(event){
        let url = event.target.dataset.id
        window.open(url, "_blank");
    }

    saveAction() {
        this.closeModal();
        eval("$A.get('e.force:refreshView').fire();");
        this[NavigationMixin.Navigate]({
                type: 'standard__objectPage',
                attributes: {
                    objectApiName: 'Product2',
                    actionName: 'list'
                }
        });
    }

    cancelAction(){
        this.closeModal();
        deleteAllFilesByRecordId({
            recordId: this.recordId
        })
        .then(result => {
            updateDisplayURL({ recordId: this.recordId, url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/330px-No-Image-Placeholder.svg.png'})
            .then(result => {
                refreshApex(this.wiredActivities);
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error!',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error!',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        })
    }

    saveAndNewAction(){
        this.closeModal();
        eval("$A.get('e.force:refreshView').fire();");
        this[NavigationMixin.Navigate]({
            "type": "standard__component",
            "attributes": {
                "componentName": 'c__createNewRecordComponent'
            }
        });
    }

}