// WARNING: THE USAGE OF CUSTOM SCRIPTS IS NOT SUPPORTED. VTEX IS NOT LIABLE FOR ANY DAMAGES THIS MAY CAUSE.
// THIS MAY BREAK YOUR STORE AND STOP SALES. IN CASE OF ERRORS, PLEASE DELETE THE CONTENT OF THIS SCRIPT.
try {
    console.log("script loaded")
    let usp = new URLSearchParams(window.location.search)
    let orderId = usp.get("og")
    if(!orderId) return
    let headers = {
        "Accept": "application/json, text/plain, */*",
        "Content-type": "application/json"
    }
    fetch("/api/checkout/pub/orders/order-group/" + orderId, { headers, "method": "GET" })
        .then(response => response.json())
        .then(orderData => {
            let { items } = orderData[0]
            let params = items.map(item => `fq=productId:${item.productId}`)
            fetch(`/api/catalog_system/pub/products/search?${params.join('&')}`, { headers, "method": "GET" })
                .then(response => response.json())
                .then(searchItems => {
                    let breaker = 0
                    let interval = setInterval(() => {
                        if (breaker > 30) {
                            clearInterval(interval)
                            return
                        }
                        breaker++
                        var nodes = document.querySelectorAll('.vtex-flex-layout-0-x-flexRow--mz-orderplaced__products .vtex-order-placed-2-x-productList .vtex-order-placed-2-x-productInfoColumn')
                        if (!nodes.length) return

                        clearInterval(interval)
                        items.map((item, index) => {
                            let sku = item.id
                            let productId = item.productId
                            let prod = searchItems.find(prod => prod.productId == productId)
                            if (!prod) return
                            let skuObject = prod.items.find(skuObj => skuObj.itemId == sku)
                            let itemSpecification = skuObject?.variations?.map(spec => {
                                return { key: spec, value: skuObject[spec].join(',') }
                            })
                            if (itemSpecification && itemSpecification.length) {
                                let node = nodes[index]

                                if (!node.querySelectorAll(".mz-sku-specs").length) {
                                    let html = generateHtml(itemSpecification)
                                    let newElement = createElementFromHTML(html)
                                    node.append(newElement)
                                }

                            }
                        })
                    }, 250)
                })
        })
} catch (e) {
    console.warn("Something went wrong with the tag MZ - OrderPlaced Sku Information")
}

function generateHtml(itemSpecification) {
    return `
    <div class="mz-sku-specs">
        ${itemSpecification.map(spec => `
        <div>
            <span>${spec.key}</span>:
            <span>${spec.value}</span>
        </div>
        `).join("")}
    </div>
`
}

function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();

    // Change this to div.childNodes to support multiple top-level nodes.
    return div.firstChild;
}