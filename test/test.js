/*
	Imports necessários para o MochaJS
*/
const request = require('supertest');
const describe = require('mocha').describe;
const expect = require('chai').expect;
const it = require('mocha').it;
const jsdom = require('jsdom');
const json = require('./arquivos/tarefas');

const {JSDOM} = jsdom;

/*
	URLs para acesso ao sistema
*/
const URL = "http://demo.redmine.org/";
const URL_CRIAR_CONTA = 'account/register';
const URL_CONTA = 'my/account';
const URL_LOGOUT = 'logout';
const URL_LOGIN = 'login';
const URL_PROJETOS = 'projects';
const URL_NOVO_PROJETO = URL_PROJETOS + '/new';

/*
	Dados do Usuário
*/
const nome_usuario = 'jefferson.ferreira';
var user = {
	'authenticity_token': '',
	'user[login]': nome_usuario,
	'user[password]': '12345',
	'user[password_confirmation]': '12345',
	'user[firstname]': 'Jefferson',
	'user[lastname]': 'Ferreira Faria',
	'user[mail]': 'jefferson_ferreira@teste.com',
	'user[language]': 'pt-BR',
};
var token;

/*
1.	   ENTRAR NO AMBIENTE http://demo.redmine.org/
2.	   CADASTRE O USUARIO
3.	   VALIDE O CADASTRO CRIADO COM SUCESSO
4.	   DESLOQUE O USUARIO NA OPÇÃO "SAIR"
*/
describe('Cadastrar usuário', () => {
		
	const http = request(URL);
	const agent = request.agent(URL);
	
	it('retornar token', (done) => {
		agent
		.get( URL_CRIAR_CONTA )
		.end( (err, res) => {
			expect( err ).to.be.a('null');
			expect( res.statusCode ).to.equal(200);			
			
			var html = new JSDOM( res.text );
			token = html.window.document.querySelector("input[name=authenticity_token]").value;
			user.authenticity_token = token;
			
			expect( user.authenticity_token ).to.be.a('string');			
			done();
		});		
	});	
	
	
	it('Registrar novo usuário', (done) => {
		
		agent.post( URL_CRIAR_CONTA )
		.set('Content-Type', 'application/x-www-form-urlencoded')
		.send(user)
		.end( (err, res) => {			
			expect( err ).to.be.a('null');
			expect( res.statusCode ).to.equal( 302 );
			expect( res.headers.location ).to.equal( URL + URL_CONTA);
			done();
		});		
	});	

	it('Logar', (done) => {
		agent.get( URL_CONTA )
		.end( (err, res) => {			
			expect( err ).to.be.a('null');
			expect( res.statusCode ).to.equal( 200 );
			
			var html = new JSDOM( res.text );
			var name = html.window.document.querySelector(".user.active").text;
			
			expect(name).to.equal( nome_usuario );
			
			done();
		});		
	});	
	
	it('Retornar token para sair', (done) => {
		agent
		.get( URL_LOGOUT )
		.end( (err, res) => {
			expect( err ).to.be.a('null');
			expect( res.statusCode ).to.equal(200);			
			
			var html = new JSDOM( res.text );
			token = html.window.document.querySelector("input[name=authenticity_token]").value;
			
			expect( token ).to.be.a('string');			
			done();
		});		
	});	
	
	it('Sair', (done) => {	
		agent
		.post( URL_LOGOUT )
		.set('Content-Type', 'application/x-www-form-urlencoded')
		.send({
			"authenticity_token": token
		})
		.end( (err, res) => {						
			expect( err ).to.be.a('null');
			expect( res.statusCode ).to.equal( 302 );
			expect( res.headers.location ).to.equal( URL );
			
			done();
		});		
	});
});





/*
5.	   LOGUE COM O USUARIO
6.	   VALIDE O LOGIN DO USUARIO
7.	   ACESSE A AREA DE PROJETOS E CRIE UM NOVO PROJETO COM SOMENTE O TIPO (BUG) SELECIONADO
8.	   VALIDE A CRIAÇÃO DO NOVO PROJETO  COM SUCESSO
9.	   ACESSE O PROJETO PELO MENO "Projetos"
10.	   CLIQUE NO PROJETO CRIADO
11.	   ENTRE NA ABA DE "NOVA TAREFA"
12.	   ATRAVÉS DE UM JSON DE DADOS DE CADASTRO DE "TAREFAS", CRIE 30 TAREFAS COM DADOS QUE ESTÃO NA MASSA DE DADOS DO JSON
13.	   ENTRE NA ABA DE "TAREFAS"
14.	   FAÇA A PAGINAÇÃO DO GRID DE TAREFAS E VALIDE SE A 29ª TAREFA POSSUI O TIPO, SITUAÇÃO, PRIORIDADE E TÍTULO CONFORME OUTRO JSON DEVALIDAÇÃO DE TAREFAS
*/
describe('Projeto', () => {
	const http = request(URL);
	const agent = request.agent(URL);
	const PROJECT_NAME = Math.random().toString(36).substr(2, 10);
	
	var user_login = {
		"back_url": URL,
		"username": nome_usuario,
		"password": user['user[password]']
	}
	
	var project = {
		"project[name]": PROJECT_NAME,
		"project[identifier]": PROJECT_NAME,
		"project[is_public]": 1,
		"project[inherit_members]": 0,
		"project[enabled_module_names][]": "issue_tracking",
		"project[tracker_ids][]": 1,
		"commit": "Criar"
	};
		
	it('Retornar token', (done) => {
		agent
		.get( URL_LOGIN )
		.end( (err, res) => {
			expect( err ).to.be.a('null');
			expect( res.statusCode ).to.equal(200);			
			
			var html = new JSDOM( res.text );
			token = html.window.document.querySelector("input[name=authenticity_token]").value;
			user_login.authenticity_token = token;
			
			expect( user_login.authenticity_token ).to.be.a('string');			
			done();
		});		
	});
	
	
	it('Logar', (done) => {
		
		agent.post( URL_LOGIN )
		.set('Content-Type', 'application/x-www-form-urlencoded')
		.send( user_login )
		.end( (err, res) => {			
			expect( err ).to.be.a('null');
			expect( res.statusCode ).to.equal( 302 );
			expect( res.headers.location ).to.equal( URL );
			done();
		});		
	});	
	
	it('Logado', (done) => {
		agent.get( URL_CONTA )
		.end( (err, res) => {			
			expect( err ).to.be.a('null');
			expect( res.statusCode ).to.equal( 200 );
			
			var html = new JSDOM( res.text );
			var name = html.window.document.querySelector(".user.active").text;
			expect(name).to.equal( nome_usuario );		
			
			done();
		});		
	});		
	
	
	it('Retornar um token para criar um novo projeto', (done) => {
		agent
		.get( URL_NOVO_PROJETO )
		.end( (err, res) => {
			expect( err ).to.be.a('null');
			expect( res.statusCode ).to.equal(200);			
			
			var html = new JSDOM( res.text );
			token = html.window.document.querySelector("input[name=authenticity_token]").value;
			project.authenticity_token = token;
			
			expect( token ).to.be.a('string');			
			done();
		});		
	});
	
	
	it('Criar novo projeto', (done) => {
		
		agent.post( URL_PROJETOS )
		.set('Content-Type', 'application/x-www-form-urlencoded')
		.send( project )
		.end( (err, res) => {				
			expect( err ).to.be.a('null');
			expect( res.statusCode ).to.equal( 302 );
			expect( res.headers.location ).to.equal( URL + URL_PROJETOS + '/' + PROJECT_NAME + '/settings');
			done();
		});		
	});	
		
	
	describe('Criar tarefas', () => {
		
		var issues = json['issues'];
		const URL_PROJECT_ISSUES = 'projects/' + PROJECT_NAME + '/issues';
		const URL_PROJECT_ISSUES_NEW = URL_PROJECT_ISSUES + '/new';
		const URL_ISSUES = 'issues';
		
		issues.forEach( (issue, index, arr) => {
			
			var desc_it_csrf = 'Retornar um token para criar um nova issue no projeto  \'' + PROJECT_NAME + "'";
			var desc_it = 'criar issue '+index+' no projeto \'' + PROJECT_NAME + "'";
			
			it(desc_it_csrf, (done, i) => {
				agent
				.get( URL_PROJECT_ISSUES_NEW )
				.end( (err, res) => {
					expect( err ).to.be.a('null');
					expect( res.statusCode ).to.equal(200);			
					
					var html = new JSDOM( res.text );
					token = html.window.document.querySelector("input[name=authenticity_token]").value;
										
					arr[index].authenticity_token = token;
					
					expect( token ).to.be.a('string');			
					done();
				});		
			});
			
			it(desc_it, (done) => {
				agent.post( URL_PROJECT_ISSUES )
				.set('Content-Type', 'application/x-www-form-urlencoded')
				.send( issue )
				.end( (err, res) => {						
					expect( err ).to.be.a('null');
					expect( res.statusCode ).to.equal( 302 );
					expect( res.headers.location ).to.have.string( URL + URL_ISSUES + '/' );
					done();
				});					
			});
		});
	});
});


function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}
