@IsTest
public with sharing class MS_ShoppingCartControllerTest {

    @TestSetup
    public static void testSetup() {
        Pricebook2 standartPricebook = new Pricebook2(Id=Test.getStandardPricebookId(), IsActive=true);
        update  standartPricebook;
        Product2 productTest = new Product2(Name='CPU i5',Model__c='i5-4434',Producer__c='Intel',ProductCode='G88E',Available__c=true,Family='CPU',IsActive=true);
        insert productTest;
        PricebookEntry standartPrice = new PricebookEntry(UnitPrice=1000,Product2Id=productTest.Id, Pricebook2Id=standartPricebook.Id, IsActive=true);
        insert standartPrice;

        Account ac = new Account(Name='GoogleAuth');
        insert ac;

        Order order = new Order();
        order.Name = 'Test Order';
        order.Status = 'Draft';
        order.EffectiveDate = system.today();
        order.EndDate = system.today() + 4;
        order.AccountId = ac.Id;
        order.PaymentMethod__c = 'Blik';
        order.Pricebook2Id =  standartPricebook.Id ;
        insert order;

        OrderItem item = new OrderItem();
        item.OrderId = order.Id;
        item.Quantity = 1;
        item.UnitPrice = 1000;
        item.Product2id = productTest.Id;
        item.PricebookEntryId = standartPrice.Id;
        insert item;

    }

    @IsTest
    public static void shouldCreateContract(){
        Id contractID = MS_ShoppingCartController.createContract();
        List<Contract> contractList = [SELECT Id, ContractTerm FROM Contract WHERE Id = :contractID];
        System.assertEquals(12,contractList[0].ContractTerm);
    }

    @IsTest
    public static void shouldGetStandardProductPrice(){
        Product2 product = [SELECT Id FROM Product2 WHERE ProductCode='G88E'] ;
        PricebookEntry entry = MS_ShoppingCartController.getProductPrice(product.Id);
        System.assertEquals(1000,entry.UnitPrice);
    }

    @IsTest
    public static void shouldGetProductDetails(){
        Product2 product = [SELECT Id, Name FROM Product2 WHERE ProductCode='G88E'];
        List<Product2> productList = MS_ShoppingCartController.getProductDetails(product.Id);
        System.assertEquals(product.Name,productList[0].Name);
    }

    @IsTest
    public static void shouldConvertOrderItemToWrapperClass(){
        Order order = [SELECT Id FROM Order WHERE Name='Test Order'];
        List<OrderItem> orderItemsList = MS_ShoppingCartController.getOrderItems(order.Id);
        OrderItem item = [SELECT Id, Product2Id, Quantity, PricebookEntryId, UnitPrice FROM OrderItem];
        MS_ShoppingCartController.OrderItemWrapper wrapperObject = new MS_ShoppingCartController.OrderItemWrapper(item);
        MS_ShoppingCartController.parseWrapperToSObject(wrapperObject,order.Id);
        System.assertEquals(1000,wrapperObject.UnitPrice);
    }

    @IsTest
    public static void shouldCreateTwoTheSameWrappers(){
        Order order = [SELECT Id FROM Order WHERE Name='Test Order'];
        OrderItem item = [SELECT Id, Product2Id, Quantity, PricebookEntryId, UnitPrice FROM OrderItem];
        MS_ShoppingCartController.OrderItemWrapper wrapperObjectV1 = new MS_ShoppingCartController.OrderItemWrapper(item);
        MS_ShoppingCartController.OrderItemWrapper wrapperObjectV2 = new MS_ShoppingCartController.OrderItemWrapper(item.Product2Id,item.Quantity,item.PricebookEntryId,item.UnitPrice);
        System.assertEquals(wrapperObjectV1.product,wrapperObjectV2.product);
        System.assertEquals(wrapperObjectV1.quantity,wrapperObjectV2.quantity);
        System.assertEquals(wrapperObjectV1.pricebookEntry,wrapperObjectV2.pricebookEntry);
        System.assertEquals(wrapperObjectV1.UnitPrice ,wrapperObjectV2.UnitPrice);
    }

    @IsTest
    public static void shouldAddOneProductToCache(){
        Order order = [SELECT Id FROM Order WHERE Name='Test Order'];
        OrderItem item = [SELECT Id, Product2Id, Quantity, PricebookEntryId, UnitPrice FROM OrderItem];
        MS_ShoppingCartController.addProductToCacheShoppingCart(item.Product2Id, item.Quantity);
        MS_ShoppingCartController.addProductToCacheShoppingCart(item.Product2Id, 3);
        Integer numberOfProductInCache = MS_ShoppingCartController.getNumberOfProductInCache();
        System.assertEquals(1,numberOfProductInCache);
    }

    @IsTest
    public static void shouldAddOneAndDeleteOneProductFromCache(){
        Order order = [SELECT Id FROM Order WHERE Name='Test Order'];
        OrderItem item = [SELECT Id, Product2Id, Quantity, PricebookEntryId, UnitPrice FROM OrderItem];
        MS_ShoppingCartController.addProductToCacheShoppingCart(item.Product2Id, item.Quantity);
        MS_ShoppingCartController.updateQuantity(item.Product2Id, 3);
        MS_ShoppingCartController.deleteProductFromCache(item.Product2Id);
        MS_ShoppingCartController.deleteAllProductsFromCache();
        Integer numberOfProductInCache = MS_ShoppingCartController.getNumberItemsInCache();
        System.assertEquals(0,numberOfProductInCache);
    }

    @IsTest
    public static void shouldGetItemsFromCache(){
        Order order = [SELECT Id FROM Order WHERE Name='Test Order'];
        OrderItem item = [SELECT Id, Product2Id, Quantity, PricebookEntryId, UnitPrice FROM OrderItem];
        Id pricebookId = MS_ShoppingCartController.getPricebook();
        MS_ShoppingCartController.addProductToCacheShoppingCart(item.Product2Id, item.Quantity);
        List<MS_ShoppingCartController.OrderItemWrapper> wrapperList = MS_ShoppingCartController.getItemsFromCache();
        System.assertEquals(item.UnitPrice,wrapperList[0].UnitPrice);
    }

}
