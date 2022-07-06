public without sharing class MS_ShoppingCartController {

    public class OrderItemWrapper {
        @AuraEnabled
        public Id product  {get; set;}
        @AuraEnabled
        public Decimal quantity {get; set;}
        @AuraEnabled
        public Id pricebookEntry {get; set;}
        @AuraEnabled
        public Decimal UnitPrice {get; set;}

        public OrderItemWrapper(){}

        public OrderItemWrapper(Id product, Decimal quantity,Id pricebookEntry, Decimal UnitPrice){
            this.product = product;
            this.quantity = quantity;
            this.pricebookEntry = pricebookEntry;
            this.UnitPrice = UnitPrice;
        }

        public OrderItemWrapper(OrderItem orderitem){
            this.product = orderitem.Product2Id;
            this.quantity = orderitem.Quantity;
            this.pricebookEntry = orderitem.PricebookEntryId;
            this.UnitPrice = orderitem.UnitPrice;
        }
    }

    @AuraEnabled
    public static void parseWrapperToSObject(MS_ShoppingCartController.OrderItemWrapper orderWrapper, Id orderId) {
        OrderItem item = new OrderItem(
                OrderId = orderId,
                Product2Id = orderWrapper.product,
                PricebookEntryId = orderWrapper.pricebookEntry,
                Quantity = orderWrapper.quantity,
                UnitPrice = orderWrapper.UnitPrice
                );
        insert item;
    }

    @AuraEnabled
    public static PricebookEntry getProductPrice(String productId){
        return [SELECT Id, UnitPrice FROM PricebookEntry WHERE Product2Id =: productId LIMIT 1];
    }
    
    @AuraEnabled(cacheable=true)
    public static Integer getNumberOfProductInCache() {
          Cache.SessionPartition sessionPart = Cache.Session.getPartition('local.ShoppingCartCache');
          Set<String> keysSet = sessionPart.getKeys();
          List<String> keysList = new List<String>(keysSet);
          return keysList.size();
    }

    @AuraEnabled
    public static Integer getNumberItemsInCache() {
          Cache.SessionPartition sessionPart = Cache.Session.getPartition('local.ShoppingCartCache');
          Set<String> keysSet = sessionPart.getKeys();
          List<String> keysList = new List<String>(keysSet);
          return keysList.size();
    }

    @AuraEnabled
    public static void deleteAllProductsFromCache(){
        Cache.SessionPartition sessionPart = Cache.Session.getPartition('local.ShoppingCartCache');
        Set<String> keys = sessionPart.getKeys();
        for(String key: keys){
            sessionPart.remove(key);
        }
    }

    @AuraEnabled
    public static void updateQuantity(Id productId, Decimal quantityItem){
        Cache.SessionPartition sessionPart = Cache.Session.getPartition('local.ShoppingCartCache');
        MS_ShoppingCartController.OrderItemWrapper oldItem = (MS_ShoppingCartController.OrderItemWrapper) Cache.Session.get(productId);
        MS_ShoppingCartController.OrderItemWrapper updateItem = oldItem;
        updateItem.quantity = quantityItem;
        sessionPart.remove(productId);
        Cache.Session.put(updateItem.product, updateItem);
    }

    @AuraEnabled(cacheable=true)
    public static List<OrderItemWrapper> getItemsFromCache(){
        List<MS_ShoppingCartController.OrderItemWrapper> items = new List<MS_ShoppingCartController.OrderItemWrapper>();
        Cache.SessionPartition sessionPart = Cache.Session.getPartition('local.ShoppingCartCache');
        Set<String> keys = sessionPart.getKeys();

        for(String key: keys){
            items.add((MS_ShoppingCartController.OrderItemWrapper) Cache.Session.get(key));
        }
        return items;
    }

    @AuraEnabled
    public static void addProductToCacheShoppingCart(Id productId, Decimal quantityItem){
        Cache.SessionPartition sessionPart = Cache.Session.getPartition('local.ShoppingCartCache');
        if(Cache.Session.contains(productId)){
            MS_ShoppingCartController.OrderItemWrapper oldItem = (MS_ShoppingCartController.OrderItemWrapper) Cache.Session.get(productId);
            MS_ShoppingCartController.OrderItemWrapper newItem = oldItem;
            newItem.quantity = oldItem.quantity + quantityItem;
            sessionPart.remove(productId);
            Cache.Session.put(newItem.product, newItem);
        } else{
        PricebookEntry entry = MS_ShoppingCartController.getProductPrice(productId);
        MS_ShoppingCartController.OrderItemWrapper item = new MS_ShoppingCartController.OrderItemWrapper();
        item.product=productId;
        item.quantity=quantityItem;
        item.pricebookEntry=entry.Id;
        item.UnitPrice=entry.UnitPrice;

        Cache.Session.put(item.product, item);
        }
    }
    
    @AuraEnabled
    public static void deleteProductFromCache(Id productId){
        Cache.SessionPartition sessionPart = Cache.Session.getPartition('local.ShoppingCartCache');
        sessionPart.remove(productId);
    }

    @AuraEnabled(cacheable = true)
    public static Id getPricebook(){
        return [SELECT Id, Name FROM Pricebook2 WHERE Name='Standard Price Book' LIMIT 1].Id;
    }

    @AuraEnabled(cacheable = true)
    public static Id getAccount(){
        return [SELECT Id FROM account WHERE Name = 'GoogleAuth' LIMIT 1].Id;
    }

    @AuraEnabled
    public static Id createContract(){
        Contract contract = new Contract(AccountId = getAccount(),StartDate = System.today(),ContractTerm = 12);
        insert contract;
        return contract.Id;
    }

}
