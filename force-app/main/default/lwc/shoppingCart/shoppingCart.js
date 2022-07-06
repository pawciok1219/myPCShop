import { LightningElement, wire, track } from 'lwc';
import getItemsFromCache from '@salesforce/apex/MS_ShoppingCartController.getItemsFromCache';
import getNumberOfProductInCache from '@salesforce/apex/MS_ShoppingCartController.getNumberOfProductInCache';
import deleteAllProductsFromCache from '@salesforce/apex/MS_ShoppingCartController.deleteAllProductsFromCache';
import { publish, MessageContext } from 'lightning/messageService';
import NumberOfProductsInCache from '@salesforce/messageChannel/NumberOfProductsInCache__c';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from "@salesforce/apex";
import MS_error from '@salesforce/label/c.MS_error';
import MS_shopping_clear from '@salesforce/label/c.MS_shopping_clear';
import MS_total_value from '@salesforce/label/c.MS_total_value';
import MS_clear_shopping_cart from '@salesforce/label/c.MS_clear_shopping_cart';
import MS_place_order from '@salesforce/label/c.MS_place_order';

export default class ShoppingCart extends LightningElement {

    label = {
        MS_total_value,
        MS_clear_shopping_cart,
        MS_place_order
    };

    @track isLoading = true;
    @track numberOfProductsInCache = 0;
    @track haveProductsInShoppingCart = false;
    @track productsCacheList = [];
    @track totalOrderPrice = 0;

    @track isDialogVisible = false;
    @track originalMessage;
    @track displayMessage = '';

    placeOrderUrl = '/s/orderform';  
    wiredActivities;
    wiredItems;

    @wire(getItemsFromCache)
    wiredItemsResulted(result){
        const {data, error} = result;
        this.wiredItems = result;
        this.productsCacheList = [];
        if(data){
            data.forEach(r=> {
                let record = Object.assign({}, r);
                record.total = r.quantity * r.UnitPrice;
                this.productsCacheList.push(record);
            });
            this.getOrderTotalPrice();
            setTimeout(()=>{
                this.isLoading = false;
            },500);
        }
        if(error){ 
            this.dispatchEvent(
                new ShowToastEvent({
                    title: MS_error,
                    message: error.body.message,
                    variant: 'error',
                }),
            );
            this.isLoading = false;
        }
    }

    @wire(getNumberOfProductInCache)
    wiredResulted(result){
        const {data, error} = result;
        this.wiredActivities = result;
        if(data){
            this.numberOfProductsInCache = data;
            if(this.numberOfProductsInCache > 0){
                this.haveProductsInShoppingCart = true;
            }else{
                this.haveProductsInShoppingCart = false;
            }
        }
        if(error){ 
            this.dispatchEvent(
                new ShowToastEvent({
                    title: MS_error,
                    message: error.body.message,
                    variant: 'error',
                }),
            );
        }
    }

    getOrderTotalPrice(){
        this.totalOrderPrice = 0;
        this.productsCacheList.forEach(r=> {
            this.totalOrderPrice = this.totalOrderPrice + r.total;
        });
    }

    refreshAfterDelete(event){
        this.totalOrderPrice=0;
        this.numberOfProductsInCache = event.detail;
        refreshApex(this.wiredItems);
        refreshApex(this.wiredActivities);
        this.isLoading = true;
        this.getOrderTotalPrice();
        setTimeout(()=>{
            if(this.numberOfProductsInCache == 0) {
                this.haveProductsInShoppingCart = false;
            }
            this.isLoading = false;
        },500);
    }

    refresh(){
        this.totalOrderPrice=0;
        refreshApex(this.wiredItems);
        refreshApex(this.wiredActivities);
        this.isLoading = true;
        this.getOrderTotalPrice();
        setTimeout(()=>{
            refreshApex(this.wiredActivities);
            this.isLoading = false;
        },400);
    }

    @wire(MessageContext)
    messageContext;

    openConfirmClearCart(){
        this.isDialogVisible = true;
    }

    closeConfirmClearCart(){
        this.isDialogVisible = false;
    }

    clearCart(){
    deleteAllProductsFromCache().then(() => {
        refreshApex(this.wiredItems);
        refreshApex(this.wiredActivities);
        this.isLoading = true;
        this.numberOfProductsInCache = 0;
        this.haveProductsInShoppingCart = false;
        this.totalOrderPrice = 0;
        const payload = {number: 0};
        publish(this.messageContext, NumberOfProductsInCache, payload);
        this.dispatchEvent(
            new ShowToastEvent({
                message: MS_shopping_clear,
            })
        );
        setTimeout(()=>{
            this.isLoading = false;
        },500);
    })
    }

    connectedCallback() {
        refreshApex(this.wiredItems);
        refreshApex(this.wiredActivities);
    }

    handleClick(event){
        if(event.target.name === 'openConfirmation'){
            this.originalMessage = 'test message';
            this.isDialogVisible = true;
        }else if(event.target.name === 'confirmModal'){
            if(event.detail !== 1){
                this.displayMessage = 'Status: ' + event.detail.status + '. Event detail: ' + JSON.stringify(event.detail.originalMessage) + '.';
                if(event.detail.status === 'confirm') {
                    this.clearCart();
                }else if(event.detail.status === 'cancel'){
                    this.isDialogVisible = false;
                }
            }
            this.isDialogVisible = false;
        }
    }

}