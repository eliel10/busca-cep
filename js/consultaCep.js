import errors from "./notificationsErrors.js";
document.addEventListener("DOMContentLoaded",()=>{
    (()=>{

        //components
        var containerSearch = document.querySelector(".container__search-cep");
        var containerTable = document.querySelector(".container__result-search");
        var btnNewSearch = document.querySelector(".result-search__back-search");
        var inputSearch = document.querySelector("#cep");
        var formSearch = document.querySelector(".search-cep__form");
        var loadingSearch = document.querySelector(".loading");
        var tbody = document.querySelector(".tbody");

        //selects and modal buttons
        var modal = document.querySelector(".modal-fullscreen");
        var selectUf = document.querySelector(".select-uf");
        var selectCity = document.querySelector(".select-citys");
        var btnConfirm = document.querySelector(".btn-confirm-modal");

        //regex
        var validInputCep = /^[0-9]{8}$/;
        var validInputCepHifen = /^[0-9]{5}-[0-9]{3}$/;
        var validInputLogradouro = /^[a-zà-ú]{3,}[a-zà-ú0-9 ]*$/i;
        
        
        inputSearch.addEventListener("input",()=>{
            inputSearch.value=inputSearch.value
            .replace(/([0-9]{5})(\d)/,"$1-$2")
            .replace(/(-[0-9]{3}).+/,"$1");
        })

        
        formSearch.addEventListener("submit",(even)=>{
            even.preventDefault();
            showDivContent(loadingSearch);
            var contentSearch = inputSearch.value;
            search(contentSearch);
        });

        
        btnConfirm.addEventListener("click",()=>{
            var uf = selectUf.value;
            var city = selectCity.value;
            var street = inputSearch.value;
            validInputsModal(uf,city,street);
            removeContentSelects();
        })

        
        btnNewSearch.addEventListener("click",()=>{
            removeContentTable();
            hiddenDivContent(containerTable);
            showDivContent(containerSearch);
            inputSearch.value="";
            inputSearch.focus();
        })

        
        modal.addEventListener("click",(e)=>{
            var modalFull = e.target;
            if(modalFull.classList.contains("modal-fullscreen")){
                removeContentSelects();
                hiddenDivContent(modalFull);
                hiddenDivContent(loadingSearch);
                showDivContent(modal.firstElementChild);
                if(modal.querySelector(".message-error")){
                    modal.removeChild(modal.querySelector(".message-error"));
                }
            }
        })

        const search = (contentSearch)=>{
            try{
                if(validInputCep.test(contentSearch)||validInputCepHifen.test(contentSearch)){
                    requestSearch("https://viacep.com.br/ws/"+contentSearch+"/json/");
                }
                else if(validInputLogradouro.test(contentSearch)){
                    showDivContent(modal);
                    requestCity();
                }
                else{
                    hiddenDivContent(loadingSearch);
                    throw 12;
                }
            }
            catch(statusError){
                showErrors(statusError);
            }
            
        }

        const requestCity = ()=>{
            selectUf.addEventListener("change",()=>{
                var uf = selectUf.value;
                removeCitySelect();
                requestSearch("https://servicodados.ibge.gov.br/api/v1/localidades/estados/"+uf+"/municipios");
            })
        }

        const requestSearch = async (url,street)=>{

            try{
                try{
                    var requestAPI = fetch(url);
                    var response = await requestAPI;
                }
                catch(error){
                    throw 13;
                }
                if(response.ok){
                    var data = await response.json();
                    validResponse(data,street);
                }
                else{
                    throw 13;
                }
            }
            catch(error){
                showErrors(error);
            }
            


            // var xhttp = new XMLHttpRequest();
            // xhttp.responseType="json";

            // xhttp.onload = ()=>{
            //     try{
            //         if(xhttp.readyState==4 && xhttp.status=="200"){
            //             validResponse(xhttp.response,street);
            //         }
            //         else{
            //             throw 13;
            //         }
            //     }
            //     catch(statusError){
            //         showErrors(statusError);
            //     }
            // };
            // xhttp.open("GET",url);
            // xhttp.send();
        }

        const validResponse = (response,street)=>{
            var cep = (response.length == undefined);
            if(cep){
                validResponseCep(response);
            }
            else if(!cep && street=="street"){
                validResponseCity(response);
            }
            else{
                loadCitySelect(response);
            }
        }

        const validResponseCep = (response)=>{
            try{
                if(response.erro){
                    throw 11;
                }
                else{
                    addContentTable([response]);
                    showTableHiddenSearch();
                }
            }
            catch(statusError){
                showErrors(statusError);
            }
            
            hiddenDivContent(loadingSearch);
        }

        const validResponseCity = (response)=>{
            try{
                if(response.length==1 && response[0].logradouro==""){
                    throw 10;
                }
                else if(!response.length==0){
                    addContentTable(response);
                    showTableHiddenSearch();
                }
                else{
                    throw 10;
                }
            }
            catch(statusError){
                showErrors(statusError);
            }
            
            hiddenDivContent(loadingSearch);
        }

        const validInputsModal = (uf,city,street)=>{
            if(uf && city && street){
                requestSearch("https://viacep.com.br/ws/"+uf+"/"+city+"/"+street+"/json/","street");
                hiddenDivContent(modal);
            }
            else{
                alert("Preencha todos os campos");
            }
        }

        const loadCitySelect = (citys)=>{
            citys.forEach(e=>{
                var option = document.createElement("option");
                option.textContent=e.nome;
                option.value=e.nome;
                selectCity.appendChild(option);
            })
        }

        const showDivContent = (div)=>{
            div.classList.remove("disabled");
        }

        const hiddenDivContent = (div)=>{
            div.classList.add("disabled");
        }

        const showTableHiddenSearch = ()=>{
            showDivContent(containerTable);
            hiddenDivContent(containerSearch);
        }

        const addContentTable = (content)=>{
            var tbody = document.querySelector(".tbody");
            content.forEach(e=>{
                const tr = document.createElement("tr");
                for(var x=0; x<filterJson(e).length;x++){
                    const td = document.createElement("td");
                    td.textContent=filterJson(e)[x];
                    tr.appendChild(td);
                }
                tbody.appendChild(tr);
            })
        }

        const removeContentSelects = ()=>{
            removeCitySelect();
            selectUf.value="";
        }

        const removeCitySelect  = ()=>{
            while(selectCity.firstChild){
                selectCity.removeChild(selectCity.firstChild);
            }
        }

        const removeContentTable = ()=>{
            tbody.querySelectorAll("tr").forEach(e=>{
                tbody.removeChild(e);
            })
        }

        const filterJson = (json)=>{
            return [json.logradouro,json.bairro,json.localidade,json.uf,json.cep,json.ddd];
        }


        const showErrors = (status)=>{
            showDivContent(modal);
            if(!modal.querySelector(".message-error")){
                hiddenDivContent(modal.firstElementChild);
                modal.innerHTML+=
                `<span class='message-error'>
                    Error[${status}]::${errors[status].title}. ${errors[status].suggestion}
                </span>`;
            }
        }

    })()

})
