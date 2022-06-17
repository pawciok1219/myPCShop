import { LightningElement, track, wire, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getStandardPriceProduct from '@salesforce/apex/MS_EditRecordController.getStandardPriceProduct';
import updateStandardPrice from '@salesforce/apex/MS_EditRecordController.updateStandardPrice';
import getRelatedFilesByRecordId from '@salesforce/apex/MS_FilePreviewAndDownloadController.getRelatedFilesByRecordId';
import deleteContentDocument from '@salesforce/apex/MS_FilePreviewAndDownloadController.deleteContentDocument';
import updateDisplayURL from '@salesforce/apex/MS_FilePreviewAndDownloadController.updateDisplayURL';
import getContentDownloadUrl from '@salesforce/apex/MS_ContentDistributionLinks.getContentDownloadUrl';
import { refreshApex } from "@salesforce/apex";
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
import DISPLAYURL_FIELD from '@salesforce/schema/Product2.DisplayUrl';
import MS_close from '@salesforce/label/c.MS_close';
import MS_error_loading_price_record from '@salesforce/label/c.MS_error_loading_price_record';
import MS_error_loading_files from '@salesforce/label/c.MS_error_loading_files';
import MS_files_uploaded from '@salesforce/label/c.MS_files_uploaded';
import MS_success from '@salesforce/label/c.MS_success';
import MS_error from '@salesforce/label/c.MS_error';
import MS_error_deleting_file from '@salesforce/label/c.MS_error_deleting_file';
import MS_error_selecting_profile from '@salesforce/label/c.MS_error_selecting_profile';
import MS_product_updated_success from '@salesforce/label/c.MS_product_updated_success';
import MS_product_updated from '@salesforce/label/c.MS_product_updated';
import MS_error_updating_price from '@salesforce/label/c.MS_error_updating_price';
import MS_edit_product from '@salesforce/label/c.MS_edit_product';
import MS_price from '@salesforce/label/c.MS_price';
import MS_price_underflow from '@salesforce/label/c.MS_price_underflow';
import MS_file_preview_big from '@salesforce/label/c.MS_file_preview_big';
import MS_file_name from '@salesforce/label/c.MS_file_name';
import MS_profile_image from '@salesforce/label/c.MS_profile_image';
import MS_preview from '@salesforce/label/c.MS_preview';
import MS_delete from '@salesforce/label/c.MS_delete';
import MS_cancel from '@salesforce/label/c.MS_cancel';
import MS_save from '@salesforce/label/c.MS_save';

const fields = [DISPLAYURL_FIELD];

export default class EditProductRecord extends NavigationMixin(LightningElement) {

    label = {
        MS_close,
        MS_edit_product,
        MS_price,
        MS_price_underflow,
        MS_file_name,
        MS_profile_image,
        MS_preview,
        MS_delete,
        MS_cancel,
        MS_file_preview_big,
        MS_save
    };

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
                    title: MS_error_loading_price_record,
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
                    title: MS_error_loading_files,
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
            title: MS_success,
            message: uploadedFiles.length +" "+MS_files_uploaded,
            variant: "success"
          })
        );
    }

    displayUrlConverted(){
        return new Promise( (resolutionFunc,rejectionFunc) => {
            getContentDownloadUrl({contentVersionId: this.contentVersionId})
            .then(result => {
                resolutionFunc(result);
            });
            }); 
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
                updateDisplayURL({ recordId: this.Id, url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/330px-No-Image-Placeholder.svg.png'})
                .then(result => {
                    refreshApex(this.wiredActivities);
                })
                .catch(error => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: MS_error,
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
                        title: MS_error_selecting_profile,
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });
        } else {
            updateDisplayURL({ recordId: this.Id, url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/330px-No-Image-Placeholder.svg.png'})
            .then(result => {
                refreshApex(this.wiredActivities);
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: MS_error,
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
        setTimeout(()=>{
            this.closeQuickAction();
        },1500);
    }

    closeQuickAction() {
        const closeQA = new CustomEvent('close');
        this.dispatchEvent(closeQA);
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
        this.closeModal();
    }

    handleSuccess(event){
        const toastEvent = new ShowToastEvent ({
            title: MS_product_updated_success,
            message: MS_product_updated,
            variant: "success"
        });
        this.dispatchEvent(toastEvent);

        updateStandardPrice({ pricebookentryId: this.pricebookentry.Id, price: this.productPrice})
        .then(result => {
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: MS_error_updating_price,
                    message: error.body.message,
                    variant: 'error'
                })
            );
        });
        refreshApex(this.wiredActivities);
        eval("$A.get('e.force:refreshView').fire();");

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.Id,
                objectApiName: 'Product2',
                actionName: 'view'
            },
        });

        setTimeout(()=>{
            window.location.reload();
        }, 1000);

        setTimeout(()=>{
                eval("$A.get('e.force:refreshView').fire();"); 
                this.closeQuickAction();
        },1000);
    }

}