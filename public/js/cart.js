                <script
                src = "//checkout.stripe.com/v2/checkout.js"
                class = "stripe-button"
                amount = "<%= foundCart.total %>"
                data - key = "<%= key %>"
                data - amount = "<%= foundCart.total * 100 %>"
                data - currency = "usd"
                data - name = "Eazy T"
                data - locale = "auto"></script>