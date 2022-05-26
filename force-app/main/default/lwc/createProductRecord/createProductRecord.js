import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { createRecord } from 'lightning/uiRecordApi';
import getStandardPricebookId from '@salesforce/apex/filePreviewAndDownloadController.getStandardPricebookId';

export default class CreateProductRecord extends LightningElement {
    @track productPrice;
    @track isModalImageOpen = false;
    @track isModalOpen = true;
    @track Id;

    openModal() {
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
    }

    handlePriceChange(event){
        this.productPrice = event.target.value;
    }

    handleSubmit(event){
        event.preventDefault();
        this.template.querySelector('lightning-record-edit-form').submit(this.fields);
        this.closeModal();
    }

    handleSuccess(event){
        const recordId = event.detail.id;
        const toastEvent = new ShowToastEvent ({
            title:"Product has been created successfully!",
            message: "Product created : " + recordId,
            variant: "success"
        });
        this.dispatchEvent(toastEvent);
        this.Id = recordId;

        getStandardPricebookId()
		.then(result => {
            let fields = {'Pricebook2Id' : result, 'Product2Id' : recordId, 'UnitPrice' : this.productPrice};
            let objRecordInput = {'apiName' : 'PricebookEntry', fields};
            createRecord(objRecordInput).then(response => {
            }).catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error in adding the price!',
                        message: error.body.message,
                        variant: 'error',
                    }),
                );
            });
		})
        this.isModalImageOpen = true;
    }

}