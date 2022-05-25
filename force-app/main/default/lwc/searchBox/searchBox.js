import { LightningElement, wire, track } from 'lwc';
import getProducts from '@salesforce/apex/customSearchProduct.getProducts';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';

import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import Producer from '@salesforce/schema/Product2.Producer__c';
import FamilyOfProduct from '@salesforce/schema/Product2.Family';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import Product2_object from '@salesforce/schema/Product2';
import MS_product_search from '@salesforce/label/c.MS_product_search';
import MS_select_producer from '@salesforce/label/c.MS_select_producer';
import MS_producer from '@salesforce/label/c.MS_producer';
import MS_select_family from '@salesforce/label/c.MS_select_family';
import MS_product_family from '@salesforce/label/c.MS_product_family';
import MS_search from '@salesforce/label/c.MS_search';
import MS_clear from '@salesforce/label/c.MS_clear';
import MS_records_not_found from '@salesforce/label/c.MS_records_not_found';
import MS_search_empty from '@salesforce/label/c.MS_search_empty';
import MS_product_name from '@salesforce/label/c.MS_product_name';
import MS_model from '@salesforce/label/c.MS_model';
import MS_product_code from '@salesforce/label/c.MS_product_code';
import MS_available from '@salesforce/label/c.MS_available';

export default class SearchBox extends NavigationMixin(LightningElement) {

    label = {
        MS_product_search,
        MS_select_producer,
        MS_producer,
        MS_select_family,
        MS_product_family,
        MS_search,
        MS_clear
    };

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
                    this.productList = [];
                    result.forEach(r=> {
                        let record =  Object.assign({}, r);
                        record.Url = `/lightning/r/Product2/${r.Id}/view`;
                        record.UrlName = r.Name;
                        record.Name = r.Name;
                        this.productList.push(record);
                    });
                    if(this.productList.length === 0) {
                        this.isNotEmpty = false;
                        this.isLoading = false;
                        const event = new ShowToastEvent({
                            message: MS_records_not_found
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
                message: MS_search_empty
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
        { label: MS_product_name, fieldName:'Url', type: 'url',  typeAttributes: {label: { fieldName: 'UrlName' }}},
        { label: MS_producer, fieldName:'Producer__c', type: 'text'},
        { label: MS_model, fieldName:'Model__c', type: 'text'},
        { label: MS_product_family, fieldName:'Family', type: 'text'},
        { label: MS_product_code, fieldName:'ProductCode', type: 'text'},
        { label: MS_available, fieldName:'Available__c', type: 'boolean'}
    ]

}