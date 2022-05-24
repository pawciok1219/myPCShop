import { LightningElement, track, wire, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getStandardPriceProduct from '@salesforce/apex/editRecordController.getStandardPriceProduct';
import updateStandardPrice from '@salesforce/apex/editRecordController.updateStandardPrice';
import getRelatedFilesByRecordId from '@salesforce/apex/filePreviewAndDownloadController.getRelatedFilesByRecordId';
import deleteContentDocument from '@salesforce/apex/filePreviewAndDownloadController.deleteContentDocument';
import updateDisplayURL from '@salesforce/apex/filePreviewAndDownloadController.updateDisplayURL';
import { refreshApex } from "@salesforce/apex";
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
import DISPLAYURL_FIELD from '@salesforce/schema/Product2.DisplayUrl';

const fields = [DISPLAYURL_FIELD];

export default class EditProductRecord extends NavigationMixin(LightningElement) {

    @track productPrice;
    @track pricebookentry;
    @track isModalOpen = true;
    @api Id;
    @track filesList = [];
    wiredActivities;
    wiredActive;
    acceptedFormats = '.png,.jpg,.jpeg';

    @wire(getStandardPriceProduct, {productId: '$Id'})
    wiredResulted(result){ 
        const {data, error} = result;
        this.wiredActive = result;
        if(data){
            this.productPrice = data.UnitPrice;
            this.pricebookentry = data;
        }
        if(error){ 
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error loading the price of this record!',
                    message: error.body.message,
                    variant: 'error',
                }),
            );
        }
    }

    @wire(getRelatedFilesByRecordId, {recordId: '$Id'})
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

    @wire(getRecord, { recordId: '$Id', fields })
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
                updateDisplayURL({ recordId: this.Id, url: ''})
                .then(result => {
                    refreshApex(this.wiredActivities);
                })
                .catch(error => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error',
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
                    title: 'Error deleting file',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        })
    }

    handleCheckBoxChange(event){
        if(event.target.checked){
            let url = event.target.value;
            updateDisplayURL({ recordId: this.Id, url: event.target.value})
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
            updateDisplayURL({ recordId: this.Id, url: ''})
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

    openModal() {
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
    }

    cancelAction(){
        this.isModalOpen = false;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.Id,
                objectApiName: 'Product2',
                actionName: 'view'
            },
        });
        eval("$A.get('e.force:refreshView').fire();");
    }

    handlePriceChange(event){
        this.productPrice = event.target.value;
    }
    
    handleSubmit(event){
        event.preventDefault();
        this.template.querySelector('lightning-record-edit-form').submit(this.fields);
        refreshApex(this.wiredActivities);
        refreshApex(this.wiredActive);
        this.closeModal();
    }

    handleSuccess(event){
        const toastEvent = new ShowToastEvent ({
            title:"Product has been updated successfully!",
            message: "Product updated.",
            variant: "success"
        });
        this.dispatchEvent(toastEvent);

        updateStandardPrice({ pricebookentryId: this.pricebookentry.Id, price: this.productPrice})
        .then(result => {
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error updating product price!',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        });
        refreshApex(this.wiredActivities);
        refreshApex(this.wiredActive);
        eval("$A.get('e.force:refreshView').fire();");

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.Id,
                objectApiName: 'Product2',
                actionName: 'view'
            },
        });
    }

}