import { LightningElement, track, wire } from 'lwc';
import  getRecentlyViewedProducts from '@salesforce/apex/MS_RecentlyViewedProducts.getRecentlyViewedProducts';

export default class RecentlyViewedProducts extends LightningElement {

    @track recentlyProductsList = [];
    numberOfrecentlyProducts = 0;


    @wire(getRecentlyViewedProducts)
    wiredResulted(result){
        const {data, error} = result;
        this.recentlyProductsList  = [];
        if(data){
            data.forEach(r=> {
                this.recentlyProductsList.push(r);
                this.numberOfrecentlyProducts ++;
            });
        }
        if(error){ 
            this.dispatchEvent(
                new ShowToastEvent({
                    title: "Error",
                    message: error.body.message,
                    variant: 'error',
                }),
            );
        }
    }
}