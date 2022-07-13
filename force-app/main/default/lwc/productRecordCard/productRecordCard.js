import { LightningElement, api, wire, track} from 'lwc';
import addProductToCacheShoppingCart from '@salesforce/apex/MS_ShoppingCartController.addProductToCacheShoppingCart';
import getNumberItemsInCache from '@salesforce/apex/MS_ShoppingCartController.getNumberItemsInCache';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { publish, MessageContext } from 'lightning/messageService';
import NumberOfProductsInCache from '@salesforce/messageChannel/NumberOfProductsInCache__c';
import MS_add_to_cart_item from '@salesforce/label/c.MS_add_to_cart_item';
import Id from '@salesforce/user/Id';

export default class ProductRecordCard extends LightningElement {

    userId = Id;
    @api product;
    sfdcBaseURL;
    listWithProducts = [];
    @track isLoading = false;
    
    renderedCallback() {
        let baseURL = '/s';
        this.sfdcBaseURL = baseURL.concat('/detail/',this.product.Id);
    }

    @wire(MessageContext)
    messageContext;


    addProductToCache(){
        this.isLoading = true;
        addProductToCacheShoppingCart({productId: this.product.Id, quantityItem: 1})
        .then(()=> {
            getNumberItemsInCache().then((result) => {
                const payload = {number: result};
                publish(this.messageContext, NumberOfProductsInCache, payload);
            });
        
            this.dispatchEvent(
                new ShowToastEvent({
                    message: this.product.Name +' '+ MS_add_to_cart_item,
                    variant: 'success'
                })
            );

            setTimeout(()=>{
                this.isLoading = false;
            },700);
        })

    }
}