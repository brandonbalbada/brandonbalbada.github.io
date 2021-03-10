
window.addEventListener('load', function () {
    var main = new Vue({
        el: '#main',
        data: {
          isNotClicked: true,
          shrink: false
        },
        mounted() {
            
            // window.addEventListener("scroll", this.scrollMe);
        },
        beforeDestroy() {
            // window.removeEventListener("scroll", this.scrollMe);
        },
        methods: {
            scrollMe: function(){
                window.scrollTo(0,0);
                
                setTimeout(() => {
                    this.isNotClicked = false;
                    this.shrink = true
                }
              , 500);
            
            }
        },
      });
})