import { LightningElement, wire, track } from 'lwc';
import getUserOrders from '@salesforce/apex/MS_ShoppingCartController.getUserOrders';
import getOrderItems from '@salesforce/apex/MS_ShoppingCartController.getOrderItems';
import getProductDetails from '@salesforce/apex/MS_ShoppingCartController.getProductDetails';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import Id from '@salesforce/user/Id';
import MS_error from '@salesforce/label/c.MS_error';
import MS_order_number from '@salesforce/label/c.MS_order_number';
import MS_data_of_order from '@salesforce/label/c.MS_data_of_order';
import MS_order_history from '@salesforce/label/c.MS_order_history';
import MS_total_amount_v2 from '@salesforce/label/c.MS_total_amount_v2';
import MS_items_in_order from '@salesforce/label/c.MS_items_in_order';
import MS_details from '@salesforce/label/c.MS_details';
import MS_quantity from '@salesforce/label/c.MS_quantity';


export default class OrderHistory extends LightningElement {

    label = {
        MS_data_of_order,
        MS_order_history,
        MS_total_amount_v2,
        MS_items_in_order,
        MS_details,
        MS_quantity
    };

    userId = Id;
    orderList = [];
    productsOrderList;
    userHaveOrders = false;
    @track isLoading = false;
    @track orderID;

    @wire(getUserOrders, {userId: '$userId'})
    wiredResult(result){ 
        this.orderList = [];
        const { data, error } = result;
        this.wiredActivities = result;
        if(data){
            if(data.length > 0){
                this.userHaveOrders = true;
            }
            data.forEach(r=> {
                let record = Object.assign({}, r);
                let baseURL = '/s';
                let sfdcBaseURL = baseURL.concat('/order/',r.Id);
                record.detailUrl = sfdcBaseURL;
                record.orderNumberLabel = MS_order_number+' '+ r.OrderNumber;
                this.orderList.push(record);
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

    handleSectionToggle(event) {
        this.isLoading = true;
        this.orderID = event.detail.openSections;
        getOrderItems({orderId: this.orderID}).then((result) => {
            this.productsOrderList = [];
            result.forEach(r=> {
                getProductDetails({productId: r.Product2Id}).then((result) => {
                    var record = Object.assign({}, r);
                    record.displayurl = result[0].DisplayUrl;
                    record.name = result[0].Name;
                    let baseURL = '/s';
                    this.sfdcBaseURL = baseURL.concat('/detail/',r.Product2Id);
                    record.url = this.sfdcBaseURL;
                    this.productsOrderList.push(record);
                })
            });
            this.orderList = this.orderList.map(
                (order) => ({
                  ...order,
                  products: this.productsOrderList
                })
            );
        })
        setTimeout(()=>{
            this.isLoading = false;
        },400);
    }

}