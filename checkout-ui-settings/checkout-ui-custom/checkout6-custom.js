// WARNING: THE USAGE OF CUSTOM SCRIPTS IS NOT SUPPORTED. VTEX IS NOT LIABLE FOR ANY DAMAGES THIS MAY CAUSE. THIS MAY BREAK YOUR STORE AND STOP SALES. IN CASE OF ERRORS, PLEASE DELETE THE CONTENT OF THIS SCRIPT.
$(function(){
    //Set interval para garantir que estamos pegando o items sem depender de atualização do orderForm
    let breaker = 0
    let interval = setInterval(()=>{
        breaker ++
        if(vtexjs?.checkout?.orderForm?.items){
            const {items} = vtexjs.checkout.orderForm
            const params = items.map(item=>`fq=productId:${item.productId}`)
            $.ajax(`/api/catalog_system/pub/products/search?${params.join('&')}`)
                .then(results=>{
                    window.searchItems = results
                    checkPage()
                })
        }
        if(breaker>40 || vtexjs?.checkout?.orderForm?.items || window.searchItems){
            clearInterval(interval)
        }
    },200)

    $(window).on("orderFormUpdated.vtex",function(orderForm){
        checkPage()
    })

    cart.afterRenderMiniCart = function() {
        generateCheckoutSkuSpecs()   
    }

    $(window).on("hashchange",function(){
        checkPage()
    })
})

function checkPage(){
    if(window.location.hash == "#/cart"){
        generateCartSkuSpecs()
    }else{
        generateCheckoutSkuSpecs()   
    }
}

function generateCheckoutSkuSpecs(){
    if(!window.searchItems || !vtexjs?.checkout?.orderForm?.items) return 
    const items = vtexjs?.checkout?.orderForm?.items

    items.map(item=>{
        let sku = item.id
        let productId = item.productId
        let prod = searchItems.find(prod=>prod.productId == productId)
        let productName = prod.productName
        let skuObject = prod.items.find(skuObj=> skuObj.itemId == sku)
        let itemSpecification = skuObject?.variations?.map(spec=>{
            return {key:spec,value:skuObject[spec].join(',')}
        })
        if(itemSpecification && itemSpecification.length){
            let el = $(".summary-cart-template-holder li.item[data-sku='"+sku+"']")
            el.find(">span.product-name").text(productName).show()
            
            if(!el.find(".mz-sku-specs").length){
                let html = generateHtml(itemSpecification)
                el.append(html)
            }

        }
    })
}

function generateCartSkuSpecs(){
    if(!window.searchItems || !vtexjs?.checkout?.orderForm?.items) return 
    const items = vtexjs?.checkout?.orderForm?.items

    items.map(item=>{
        let sku = item.id
        let productId = item.productId
        let prod = searchItems.find(prod=>prod.productId == productId)
        let productName = prod.productName
        let skuObject = prod.items.find(skuObj=> skuObj.itemId == sku)
        let itemSpecification = skuObject?.variations?.map(spec=>{
            return {key:spec,value:skuObject[spec].join(',')}
        })
        let el = $(".product-item[data-sku='"+sku+"'] .product-name")
        if(itemSpecification && itemSpecification.length){
                el.css({"visibility":"visible"})
            
            if(!el.find(".mz-sku-specs").length){
                el.find(">a#product-name"+sku).text(productName)
                let html = generateHtml(itemSpecification)
                el.append(html)
            }

        }else{
            el.css({"visibility":"visible"})
        }
    })

}

function generateHtml(itemSpecification){
    return `
        <div class="mz-sku-specs">
            ${itemSpecification.map(spec=>`
            <div>
                <span>${spec.key}</span>:
                <span>${spec.value}</span>
            </div>
            `).join("")}
        </div>
    `
}