# 💳 PagBank para Wix

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PagBank](https://img.shields.io/badge/PagBank-Wix-blue)](https://pbintegracoes.com/wix)
[![Wix](https://img.shields.io/badge/Wix-SPI-green)](https://www.wix.com)

> **Integração criada por Parceiro Oficial PagBank para lojas Wix** - Aceite pagamentos via PIX, cartão de crédito e boleto com as melhores taxas do mercado brasileiro.

## 🚀 Sobre o Projeto

Este projeto oferece uma integração completa e **código aberto** do PagBank para lojas virtuais Wix, permitindo que você receba pagamentos de forma segura e econômica. Com mais de **10 anos de parceria oficial** com o PagBank/PagSeguro, oferecemos uma solução confiável e transparente.

### ✨ Principais Benefícios

- 💰 **Economia**: Reduza significativamente os custos com taxas do PagBank e Wix
- 🔓 **Código Aberto**: Transparência total - sem código criptografado ou ofuscado
- 🛡️ **Segurança**: Sistema antifraude nativo do PagBank
- ⚡ **PIX Instantâneo**: Recebimento em até 1 hora
- 🎯 **Experiência Comprovada**: Parceria oficial desde 2014

## 🛠️ Métodos de Pagamento Suportados

| Método | Descrição | Tempo de Recebimento |
|--------|-----------|---------------------|
| **PIX** | Pagamento instantâneo | Até 1 hora |
| **Cartão de Crédito** | Visa, Mastercard, Elo, etc. | 14 ou 30 dias |
| **Boleto** | Pagamento tradicional | 2 dias úteis |

## 📋 Pré-requisitos

- ✅ **Conta Wix**: Plano Essencial ou Superior
- ✅ **Conta PagBank**: Tipo Vendedor ou Empresarial
- ✅ **Connect Key**: Obtenha em [pbintegracoes.com/connect/autorizar](https://pbintegracoes.com/connect/autorizar)

## 🚀 Instalação

Para instalar e configurar o PagBank no seu Wix, siga as **instruções oficiais detalhadas** disponíveis em:

### 📖 [Instruções de Instalação - PagBank no Wix](https://pbintegracoes.com/wix/#instalar-pagbank-wix)

As instruções oficiais incluem:

1. **Download do módulo** - Baixe a versão mais recente do código aberto
2. **Criação das pastas** - Configure o plugin no Wix Studio
3. **Cópia dos arquivos** - Instale os arquivos necessários
4. **Configuração** - Conecte sua Connect Key e habilite os métodos de pagamento

> ⚠️ **Importante**: Siga sempre as instruções oficiais para garantir a instalação correta e o funcionamento adequado da integração.

## ⚙️ Configuração

### Connect Key

#### Produção
Obtenha sua Connect Key de produção em [pbintegracoes.com/connect/autorizar](https://pbintegracoes.com/connect/autorizar)
- Formato: `CONxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

#### Testes (Sandbox)
Para testes, obtenha sua Connect Key de sandbox em [pbintegracoes.com/connect/sandbox](https://pbintegracoes.com/connect/sandbox)
- Formato: `CONSANDBOXxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Connect Key de Testes Pública**: `CONSANDBOX795E98520284853531616BF851FF2B`

## 🔧 Funcionalidades

### ✅ Recursos Implementados
- [x] Integração com Checkout PagBank
- [x] Criação de transações
- [x] Notificações automáticas de status
- [x] Reembolsos/Refund
- [x] Suporte a múltiplos métodos de pagamento
- [x] Validação de credenciais
- [x] Modo sandbox para testes
- [x] Logs detalhados para debugging

### 🔄 Fluxo de Pagamento
1. **Cliente finaliza compra** → Wix envia dados para PagBank
2. **PagBank processa pagamento** → Cliente é redirecionado para checkout
3. **Pagamento confirmado** → PagBank notifica Wix automaticamente
4. **Status atualizado** → Pedido é marcado como pago na loja

## 🧪 Testes

### Modo Sandbox
Para testar a integração, use uma Connect Key de sandbox:
```
CONSANDBOXxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Cenários de Teste
- ✅ Pagamento aprovado
- ✅ Pagamento recusado
- ✅ Pagamento pendente
- ✅ Reembolso
- ✅ Notificações de status

## 📊 Monitoramento

### Logs
Todos os eventos são logados no console do Wix em **Ferramentas do Desenvolvedor > Logging Tools > Wix Logs**.

## 🆘 Suporte

- 📚 [Central de Ajuda / Wix](https://ajuda.pbintegracoes.com/hc/pt-br/categories/37658479926413-Wix-Stores)
- 🔗 [Site Oficial](https://pbintegracoes.com/wix/?utm_source=github-wix&utm_content=readme)
- 📧 [Suporte Técnico](https://ajuda.pbintegracoes.com/hc/pt-br/requests/new)
- 💬 [Central de Ajuda Geral](https://ajuda.pbintegracoes.com/hc/pt-br)

## ⚖️ Garantia e Termos de Privacidade

### Garantia
Esta integração é disponibilizada **"as-is"** (como está), sem nenhuma garantia de funcionamento, expressa ou implícita. O uso desta integração é de total responsabilidade do usuário.

### Termos de Privacidade
Para informações sobre termos de uso e privacidade, consulte: [pbintegracoes.com/terms](https://pbintegracoes.com/terms/?utm_source=github-wix&utm_source=readme)

## 📄 Licença

Este projeto está licenciado sob a [Licença MIT](LICENSE) - veja o arquivo LICENSE para detalhes.

## ⚠️ Disclaimer

Esta integração não possui vínculo oficial com a marca ou empresa Wix. Wix e Wix Stores, bem como suas logomarcas, são de propriedade da Wix.com Ltd.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. 🍴 Fazer um Fork do projeto
2. 🌿 Criar uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. 📤 Push para a branch (`git push origin feature/AmazingFeature`)
5. 🔄 Abrir um Pull Request


---

<div align="center">
  <p>Desenvolvido com ❤️ para a comunidade Wix Brasil</p>
  <p>
    <a href="https://pbintegracoes.com/wix/?utm_source=github-wix&utm_content=readme">🌐 Site Oficial</a> •
    <a href="https://ajuda.pbintegracoes.com/hc/pt-br">📚 Documentação</a> •
    <a href="https://ajuda.pbintegracoes.com/hc/pt-br/requests/new">💬 Suporte</a>
  </p>
</div>
