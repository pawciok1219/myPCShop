import { LightningElement, track, wire } from 'lwc';
import Id from '@salesforce/user/Id';
import getNumberOfProductInCache from '@salesforce/apex/MS_ShoppingCartController.getNumberOfProductInCache';
import { refreshApex } from "@salesforce/apex";
import { subscribe, MessageContext } from 'lightning/messageService';
import NumberOfProductsInCache from '@salesforce/messageChannel/NumberOfProductsInCache__c';


export default class ShoppingIcon extends LightningElement {
    userId = Id;
    @track numberOfProductsInCache = 0;
    @track haveProductsInShoppingCart = false;
    wiredActivities;
    subscription = null;
    sfdcBaseURL = '/s/shoppingcart';    
    

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
    }

    connectedCallback() {
        this.subscribeToMessageChannel();
    }

    @wire(MessageContext)
    messageContext;

    subscribeToMessageChannel() {
        this.subscription = subscribe(
          this.messageContext,
          NumberOfProductsInCache,
          (message) => this.handleMessage(message)
        );
    }

    handleMessage(message){
        this.numberOfProductsInCache = message.number;
        if(this.numberOfProductsInCache > 0){
            this.haveProductsInShoppingCart = true;
        }else{
            this.haveProductsInShoppingCart = false;
        }
        refreshApex(this.wiredActivities);
    }
}