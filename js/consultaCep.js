document.addEventListener("DOMContentLoaded",()=>{
    (()=>{
        var containerSearch = document.querySelector(".container__consulta-cep");
        var containerTable = document.querySelector(".container__resultado-busca");
        var btnNewSearch = document.querySelector(".resultado-busca__volta-busca");
        var inputSearch = document.querySelector("#cep");
        var formSearch = document.querySelector(".consulta-cep__form");
        var loadingSearch = document.querySelector(".loading");
        var tbody = document.querySelector(".tbody");

        //selects and modal buttons
        var modalUf = document.querySelector(".modal-fullscreen");
        var selectUf = document.querySelector(".select-uf");
        var selectCity = document.querySelector(".select-cidades");
        var btnConfirm = document.querySelector(".btn-confirm-modal");

        var validInputCep = /^[0-9]{8}$/;
        var validInputCepHifen = /^[0-9]{5}-[0-9]{3}$/;
        var validInputLogradouro = /^[a-zà-ú]{3,}[a-zà-ú0-9 ]*$/i;
        
        //mask CEP
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

        modalUf.addEventListener("click",(e)=>{
            var modalFull = e.target;
            if(modalFull.classList.contains("modal-fullscreen")){
                removeContentSelects();
                hiddenDivContent(modalFull);
                hiddenDivContent(loadingSearch);
            }
        })

        const search = (contentSearch)=>{
            if(validInputCep.test(contentSearch)||validInputCepHifen.test(contentSearch)){
                requestSearch("http://viacep.com.br/ws/"+contentSearch+"/json/");
            }
            else if(validInputLogradouro.test(contentSearch)){
                showDivContent(modalUf);
                requestCity();
            }
            else{
                alert("Informações invalidas");
                hiddenDivContent(loadingSearch);
            }
        }

        const requestCity = ()=>{
            selectUf.addEventListener("change",()=>{
                var uf = selectUf.value;
                removeCitySelect();
                requestSearch("http://servicodados.ibge.gov.br/api/v1/localidades/estados/"+uf+"/municipios");
            })
        }

        const requestSearch = (url,street)=>{
            var xhttp = new XMLHttpRequest();
            xhttp.responseType="json";

            xhttp.onload = ()=>{
                if(xhttp.readyState==4 && xhttp.status=="200"){
                    validResponse(xhttp.response,street);
                }
                else{
                    alert("Requisição não concluida");
                }
            };
            xhttp.open("GET",url);
            xhttp.send();
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
            if(response.erro){
                alert("Endereço não encontrado, verifique se o CEP está correto");
            }
            else{
                addContentTable([response]);
                showTableHiddenSearch();
            }
            hiddenDivContent(loadingSearch);
        }

        const validResponseCity = (response)=>{
            if(response.length==1 && response[0].logradouro==""){
                alert("Nao encontrado");
            }
            else if(!response.length==0){
                addContentTable(response);
                showTableHiddenSearch();
            }
            else{
                alert("Nao encontrado");
            }
            hiddenDivContent(loadingSearch);
        }

        const validInputsModal = (uf,city,street)=>{
            if(uf && city && street){
                requestSearch("http://viacep.com.br/ws/"+uf+"/"+city+"/"+street+"/json/","street");
                hiddenDivContent(modalUf);
            }
            else{
                alert("Preencha todos os campos");
            }
        }

        const loadCitySelect = (citys)=>{
            citys.forEach(e=>{
                var option = document.createElement("option");
                option.textContent=e.nome;
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
                for(var x=0; x<filterJason(e).length;x++){
                    const td = document.createElement("td");
                    td.textContent=filterJason(e)[x];
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

        const filterJason = (json)=>{
            return [json.logradouro,json.bairro,json.localidade,json.uf,json.cep,json.ddd];
        }


    })()

})
