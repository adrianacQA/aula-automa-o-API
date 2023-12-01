/// <reference types="cypress" />
import contrato from '../../contracts/produtos.contract'

describe('Testes da Funcionalidade Produtos', () => {
    let token
    before(() => {
        cy.token('fulano@qa.com', 'teste').then(tkn => { token=tkn })
    });

    it.only('Deve validar contrato de produtos', () => {
        cy.request('http://localhost:3000/produtos').then(response => {
            return contrato.validateAsync(response.body)
        })
    });
    
    it('Listar produtos', () => {
        cy.request({
            method: 'GET',
            url: 'http://localhost:3000/produtos'
        }).then((response) => {
            console.log(response)
            expect(response.body.produtos[3].nome).to.equal('Notebook Acer 50005257')
            expect(response.status).to.equal(200)
            expect(response.body).to.have.property('produtos')
            expect(response.duration).to.be.lessThan(15)
        })
    });

    it('Cadastrar produto', () => {
        let produto = `Notebook Acer ${Math.floor(Math.random() * 100000000)}`
        cy.request({
            method: 'POST',
            url: 'http://localhost:3000/produtos',
            body: {
                "nome": produto,
                "preco": 3000,
                "descricao": "Notebook",
                "quantidade": 500
              },
              headers: {authorization: token}
        }).then((response) => {
            expect(response.status).to.equal(201)
            expect(response.body.message).to.equal('Cadastro realizado com sucesso')
        })
    });

    it('Deve validar mensagem de erro ao cadastrar produto repetido', () => {
        cy.cadastrarProduto(token, "Notebook Acer", 3000, "Descrição do Produto Novo", 500).then((response) => {
            expect(response.status).to.equal(400)
            expect(response.body.message).to.equal('Já existe produto com esse nome')
        })   
    });

    it('Deve Editar um produto já cadastrado', () => {
       cy.request('http://localhost:3000/produtos').then((response) => {
        let id = response.body.produtos[0]._id
        cy.request({
            method: 'PUT',
            url: `http://localhost:3000/produtos/${id}`,
            headers: {authorization: token},
            body: {
                "nome": "Notebook Acer v4",
                "preco": 3000,
                "descricao": "Produto Editado",
                "quantidade": 381
              }
        }).then((response) => {
            expect(response.body.message).to.equal('Registro alterado com sucesso')
        })
       })
    });

    it('Deve editar um produto cadastrado previamente', () => {
        let produto = `Notebook Acer ${Math.floor(Math.random() * 100000000)}`
        cy.cadastrarProduto(token, produto, 3000, "Descrição do Produto Novo", 500)
        .then(response => {
            let id = response.body._id

            cy.request({
                method: 'PUT',
                url: `http://localhost:3000/produtos/${id}`,
                headers: {authorization: token},
                body: {
                    "nome": produto,
                    "preco": 3000,
                    "descricao": "Produto Editado",
                    "quantidade": 500
                  }
            }).then((response) => {
                expect(response.body.message).to.equal('Registro alterado com sucesso')
            })
        })
    });

    it('Deve deletar um produto previamente cadastrado', () => {
        let produto = `Notebook Acer ${Math.floor(Math.random() * 100000000)}`
        cy.cadastrarProduto(token, produto, 3000, "Descrição do Produto Novo", 500)
        .then(response => {
            let id = response.body._id
            cy.request({
                method: 'DELETE',
                url: `http://localhost:3000/produtos/${id}`,
                headers: {authorization: token}
            }).then(response => {
                expect(response.body.message).to.equal('Registro excluído com sucesso')
                expect(response.status).to.equal(200)
            })
        })
    });
});