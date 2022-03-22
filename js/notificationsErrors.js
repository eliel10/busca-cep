var errors = 
{
    10:{
        title:"Rua não encontrada!",
        causes:"Rua não pertence a cidade selecionada",
        suggestion:"Verifique se o nome está correto"
    },
    11:{
        title:"CEP não encontrado!",
        causes:"CEP não pertence ao território brasileiro",
        suggestion:"Verifique se o número esta correto"
    },
    12:{
        title:"Dado incorreto!",
        causes:"Número de caracteres abaixo de três; espaços em branco",
        suggestion:"Para CEP digite 8 números, para rua digite pelo menos 3 caracteres"
    },
    13:{
        title:"Requisição não concluida",
        causes:"Url da API invalida",
        suggestion:"Entre em contato com o administrador do sistema"
    }
}

export default errors;