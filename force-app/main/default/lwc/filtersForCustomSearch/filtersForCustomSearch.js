import { LightningElement, track, api } from 'lwc';
import searchProductsByFilters from '@salesforce/apex/MS_CustomSearchController.searchProductsByFilters';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import MS_error from '@salesforce/label/c.MS_error';
import MS_filters from '@salesforce/label/c.MS_filters';
import MS_apply_filters from '@salesforce/label/c.MS_apply_filters';

export default class FiltersForCustomSearch extends LightningElement {

    label = {
        MS_filters,
        MS_apply_filters
    };


    @track productFamily;
    @track producerValue;
    @track productPriceFrom = 10;
    @track productPriceTo = 700;
    @api listOfProducts;

    handleMessage(message){
        this.listOfProducts = message.recordData;
    }

    handleGetFamilyValue(event){
        this.productFamily = event.detail;
    }
    
    handleProducerChange(event){
        this.producerValue = event.detail;
    }

    handlePriceChange(event){
        this.productPriceFrom = event.detail.start;
        this.productPriceTo = event.detail.end;
    }

    handleClick(event){
        searchProductsByFilters({
            producer: this.producerValue,
            family: this.productFamily,
            minPrice: this.productPriceFrom,
            maxPrice: this.productPriceTo,
            ids: this.listOfProducts
        })
        .then(result => {
            const prodEvent = new CustomEvent("changeproducts",{
                detail: {products: result }
            });
    
            this.dispatchEvent(prodEvent);
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: MS_error,
                    message: error.body.message,
                    variant: 'error'
                })
            );
        })
    }
}