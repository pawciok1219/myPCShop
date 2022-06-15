import { LightningElement, track, wire } from 'lwc';
import  getRecentlyViewedProducts from '@salesforce/apex/MS_RecentlyViewedProducts.getRecentlyViewedProducts';
import MS_error from '@salesforce/label/c.MS_error';
import MS_recently_viewed from '@salesforce/label/c.MS_recently_viewed';

export default class RecentlyViewedProducts extends LightningElement {

    label = {
        MS_recently_viewed
    };

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
                    title: MS_error,
                    message: error.body.message,
                    variant: 'error',
                }),
            );
        }
    }
}