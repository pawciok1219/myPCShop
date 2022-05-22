import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { createRecord } from 'lightning/uiRecordApi';

export default class EditProductRecord extends LightningElement {

    @track productPrice;
    @track isModalOpen = false;
    @track Id = '01t7Q000000oQVfQAM';

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
        var fields = {'Pricebook2Id' : '01s7Q000006w2QqQAI', 'Product2Id' : recordId, 'UnitPrice' : this.productPrice};
        var objRecordInput = {'apiName' : 'PricebookEntry', fields};
        createRecord(objRecordInput).then(response => {
        }).catch(error => {
            alert('Error: ' +JSON.stringify(error));
        });

        this.isModalImageOpen = true;
    }



}