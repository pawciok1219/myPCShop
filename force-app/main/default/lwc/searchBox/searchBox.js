import { LightningElement, wire, track } from 'lwc';
import getProducts from '@salesforce/apex/customSearchProduct.getProducts';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';

import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import Producer from '@salesforce/schema/Product2.Producer__c';
import FamilyOfProduct from '@salesforce/schema/Product2.Family';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import Product2_object from '@salesforce/schema/Product2';

const actions = [
    { label: 'View', name: 'view' }
];

export default class SearchBox extends NavigationMixin(LightningElement) {
    @wire(getObjectInfo, { objectApiName: Product2_object })
    productInfo;

    @wire(getPicklistValues,
        {
            recordTypeId: '$productInfo.data.defaultRecordTypeId',
            fieldApiName: FamilyOfProduct
        }
    )
    familySourceValues;

    @wire(getPicklistValues,
        {
            recordTypeId: '$productInfo.data.defaultRecordTypeId',
            fieldApiName: Producer
        }
    )
    producerSourceValues;

    @track productName = '';
    @track productCode = '';
    @track productModel = '';
    @track producer = '';
    @track productFamily = '';
    @track productList = [];
    @track isNotEmpty = false;
    @track isLoading = false;

    retrieveProducts ({error, data}){
        if(data){
            this.productList = data;
            this.isNotEmpty = true;
        }else if(error){

        }
    }

    handleNameChange(event){
        this.productName = event.detail;
    }
    handleCodeChange(event){
        this.productCode = event.detail;
    }
    handleModelChange(event){
        this.productModel = event.detail;
    }
    handleProducerChange(event){
        this.producer = event.target.value;
    }
    handleFamilyChange(event){
        this.productFamily = event.target.value;
    }

    handleSearchKeyword(){
        this.isLoading = true;

        if(this.producer == 'None'){
            this.producer = '';
        }
        if(this.productFamily == 'None'){
            this.productFamily = '';
        }

        if (this.productName !== '' || this.productModel !== '' || this.productCode !== '' || this.producer !== '' || this.productFamily !== '') {
            getProducts({
                productName: this.productName,
                model: this.productModel,
                productCode: this.productCode,
                producer: this.producer,
                family: this.productFamily
                })
                .then(result => {
                    this.productList = result;
                    if(this.productList.length === 0) {
                        this.isNotEmpty = false;
                        this.isLoading = false;
                        const event = new ShowToastEvent({
                            message: 'Records were not found.'
                        });
                        this.dispatchEvent(event); 
                    } else {
                        this.isNotEmpty = true;
                        this.isLoading = false;
                    }
                })
                .catch(error => {
                    const event = new ShowToastEvent({
                        title: 'Error',
                        variant: 'error',
                        message: error.body.message,
                    });
                    this.dispatchEvent(event);
                    this.productList = null;
                    this.isNotEmpty = false;
                    this.isLoading = false;
                });
        } else {
            this.isNotEmpty = false;
            const event = new ShowToastEvent({
                message: 'All of the search fields are empty.'
            });
            this.dispatchEvent(event);   
            this.isLoading = false;
        }
    }

    handleClearKeyword(){
        this.isLoading = true;
        this.productName = '';
        this.productModel = ''; 
        this.productCode = '';
        this.producer = '';
        this.productFamily = '';
        this.isNotEmpty = false;
        this.isLoading = false;
        eval("$A.get('e.force:refreshView').fire();");
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        switch ( actionName ) {
            case 'view':
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: row.Id,
                        actionName: 'view'
                    }
                });
                break;
            default:
        }
    }

    cols = [
        { label:'Product name', fieldName:'Name', type: 'text'},
        { label:'Producer', fieldName:'Producer__c', type: 'text'},
        { label:'Model', fieldName:'Model__c', type: 'text'},
        { label:'Product Family', fieldName:'Family', type: 'text'},
        { label:'Product Code', fieldName:'ProductCode', type: 'text'},
        { label:'Available', fieldName:'Available__c', type: 'boolean'},
        {
            type: 'action',
            typeAttributes: { rowActions: actions },
        }
    ]

}