@IsTest
public with sharing class MS_RecentlyViewedProductsTest {
    
    @IsTest
    public static void shouldNotReturnRecentlyViewedProduct(){
        List<Product2> recentlyProduct = MS_RecentlyViewedProducts.getRecentlyViewedProducts();
        System.assertEquals(0,recentlyProduct.size());
    }
}