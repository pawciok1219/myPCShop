import { LightningElement, api, wire, track } from 'lwc';
import getRelatedFilesByRecordId from '@salesforce/apex/filePreviewAndDownloadController.getRelatedFilesByRecordId';
import deleteContentDocument from '@salesforce/apex/filePreviewAndDownloadController.deleteContentDocument';
import updateDisplayURL from '@salesforce/apex/filePreviewAndDownloadController.updateDisplayURL';
import deleteAllFilesByRecordId from '@salesforce/apex/filePreviewAndDownloadController.deleteAllFilesByRecordId';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from "@salesforce/apex";
import {NavigationMixin} from 'lightning/navigation';
import { getRecord, getFieldValue} from 'lightning/uiRecordApi';
import DISPLAYURL_FIELD from '@salesforce/schema/Product2.DisplayUrl';

const fields = [DISPLAYURL_FIELD];


export default class FilePreviewAndDownloads extends NavigationMixin(LightningElement) {

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
            this.filesList = Object.keys(data).map(item=>({"label":data[item].Title,
             "value": data[item].ContentDocumentId,
             "imageurl":`/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480&versionId=${data[item].Id}&operationContext=CHATTER&contentId=${data[item].ContentDocumentId}`,
             "fileextension": data[item].FileExtension,
             "isProfileImage": this.isProfileImageCheck(`/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480&versionId=${data[item].Id}&operationContext=CHATTER&contentId=${data[item].ContentDocumentId}`)
            }))
        }
        if(error){ 
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error loading record files!',
                    message: error.body.message,
                    variant: 'error',
                }),
            );
        }
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
                        title: 'Error in selecting profile image!',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });
        } else {
            updateDisplayURL({ recordId: this.recordId, url: ''})
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
                updateDisplayURL({ recordId: this.recordId, url: ''})
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
                    title: 'Error deleting file!',
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
            message: uploadedFiles.length + " Files Uploaded Successfully.",
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
            updateDisplayURL({ recordId: this.recordId, url: ''})
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