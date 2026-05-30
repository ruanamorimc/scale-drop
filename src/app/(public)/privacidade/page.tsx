import React from "react";

export default function PoliticaDePrivacidade() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-zinc-800 dark:text-zinc-300 py-20 px-6 sm:px-12 lg:px-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-10 text-center">
          POLÍTICA DE PRIVACIDADE
        </h1>

        <div className="space-y-6 text-sm sm:text-base leading-relaxed">
          <p>
            Esta Política de Privacidade ("Política") é disponibilizada e mantida pela <strong>[NOME DA SUA EMPRESA LTDA]</strong>, pessoa jurídica de direito privado, regularmente registrada sob o CNPJ n° <strong>[00.000.000/0001-00]</strong>, com sede à <strong>[Rua, Número, Bairro, Cidade – Estado, CEP]</strong>.
          </p>

          <p>
            Na Scale Drop, privacidade e segurança são prioridades e nos comprometemos com a transparência do tratamento de dados pessoais dos nossos Usuários e de terceiros. Esta Política de Privacidade estabelece como é feita a coleta, uso e transferência de informações de Usuários que utilizam a Plataforma Scale Drop, bem como dados de terceiros por estes coletados e adicionados à Plataforma.
          </p>

          {/* CONCEITOS E DEFINIÇÕES */}
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mt-10 mb-4">
            CONCEITOS E DEFINIÇÕES
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>DADO PESSOAL:</strong> Qualquer informação relacionada a uma pessoa física identificada ou identificável;</li>
            <li><strong>DADO SENSÍVEL:</strong> dado pessoal sobre origem racial ou étnica, convicção religiosa, opinião política, filiação a sindicato ou a organização de caráter religioso, filosófico ou político, dado referente à saúde ou à vida sexual, dado genético ou biométrico, quando vinculado a uma pessoa natural;</li>
            <li><strong>ANONIMIZAÇÃO:</strong> Utilização de meios técnicos razoáveis e disponíveis no momento do Tratamento para que um Dado Pessoal não mais possa ser associado, direta ou indiretamente, a um indivíduo;</li>
            <li><strong>USO COMPARTILHADO DE DADOS:</strong> comunicação, difusão, transferência internacional, interconexão de dados pessoais ou tratamento compartilhado de bancos de dados pessoais por órgãos e entidades públicos no cumprimento de suas competências legais, ou entre esses e entes privados, reciprocamente, com autorização específica, para uma ou mais modalidades de tratamento permitidas por esses entes públicos, ou entre entes privados;</li>
            <li><strong>BANCO DE DADOS:</strong> Conjunto estruturado de dados pessoais, estabelecido em um ou em vários locais, em suporte eletrônico ou físico.</li>
            <li><strong>BASE LEGAL:</strong> Hipóteses previstas nos artigos 7º e 11 da LGPD que autorizam a Scale Drop a Tratar os Dados Pessoais dos Titulares;</li>
            <li><strong>CONSENTIMENTO:</strong> Manifestação livre, informada e inequívoca pela qual o Titular concorda com o Tratamento de seus Dados Pessoais para uma finalidade determinada;</li>
            <li><strong>CONTROLADOR:</strong> É a pessoa física ou jurídica, de direito público ou privado, a quem competem as decisões referentes ao Tratamento de Dados Pessoais;</li>
            <li><strong>COOKIES:</strong> Os cookies são uma tecnologia que pode ser usada para ajudar a personalizar o uso de um site. Um cookie é uma pequena quantidade de dados que geralmente inclui um identificador exclusivo que é enviado para seu dispositivo a partir do site e é armazenado no navegador ou disco rígido do seu dispositivo;</li>
            <li><strong>ENCARREGADO:</strong> pessoa indicada pela Scale Drop, responsável por garantir o atendimento dos direitos dos Titulares e esclarecer dúvidas sobre o Tratamento de seus Dados Pessoais, podendo também ser conhecido como Data Protection Office - DPO;</li>
            <li><strong>FINALIDADE:</strong> motivo pelo qual o Dado Pessoal será Tratado, ou objetivo que se pretende atingir com o Tratamento dos Dados;</li>
            <li><strong>LGPD:</strong> Trata-se da Lei Geral de Proteção de Dados (Lei n° 13.709/2018);</li>
            <li><strong>ANDP:</strong> Autoridade Nacional de Proteção de Dados, órgão da administração pública responsável por zelar, implementar e fiscalizar o cumprimento da Lei Geral de Proteção de Dados em todo o território nacional.</li>
            <li><strong>OPERADOR:</strong> É a pessoa física ou jurídica, de direito público ou privado, que realiza o Tratamento de Dados Pessoais em nome do Controlador;</li>
            <li><strong>TERCEIRO:</strong> Refere-se, mas não está limitado, a toda e qualquer pessoa física ou jurídica, cujos dados a Scale Drop venha a ter acesso direta ou indiretamente, no âmbito do software Scale Drop, como por exemplo, fornecedores, clientes dos nossos clientes, colaboradores ou representantes dos nossos clientes;</li>
            <li><strong>TITULAR:</strong> Pessoa física a quem se referem os Dados Pessoais, tais como clientes e usuários;</li>
            <li><strong>TRATAMENTO:</strong> Qualquer operação, ou conjunto de operações, realizada com Dados Pessoais.</li>
          </ul>

          {/* 1. DADOS COLETADOS */}
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mt-10 mb-4">
            1. DADOS COLETADOS E FORMA DE COLETA
          </h2>
          <p>
            <strong>1.1.</strong> Enquanto Controladora de dados, a Scale Drop poderá coletar dados pessoais necessários para a prestação de seus respectivos serviços, destinada à criação e gestão da conta, incluindo, mas não se limitando a, nome, endereço de e-mail, informações de contato e número de documento. A coleta ocorre através do cadastro na plataforma, interações com nossos serviços, podendo também ocorrer através de cookies e tecnologias similares, ou ainda, por autorização especificamente coletada de outro modo.
          </p>

          {/* Tabela Responsiva (Cards) para a Coleta de Dados */}
          <div className="my-8 flex flex-col gap-4">
            <div className="bg-zinc-50 dark:bg-[#111] border border-zinc-200 dark:border-white/10 rounded-xl p-5">
              <h4 className="font-bold text-zinc-900 dark:text-white mb-2">Finalidade: Cadastro e Execução Contratual</h4>
              <p className="mb-2"><strong>Dados Coletados:</strong> Nome, e-mail, contato telefônico, endereço, tipo de plano contratado, dados financeiros e credenciais de acesso.</p>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm"><strong>Fundamento Legal:</strong> Quando necessário para a execução de contrato ou de procedimentos preliminares relacionados a contrato - art. 7°, V, da LGPD.</p>
            </div>

            <div className="bg-zinc-50 dark:bg-[#111] border border-zinc-200 dark:border-white/10 rounded-xl p-5">
              <h4 className="font-bold text-zinc-900 dark:text-white mb-2">Finalidade: Experiência, Autenticação e Segurança</h4>
              <p className="mb-2"><strong>Dados Coletados:</strong> Dados de acesso e utilização (tipo de plano, interações, data/hora), informações técnicas de URL, Cookies, IP, geolocalização, dispositivo, rede, navegador e sistema operativo. Dados de log em atendimento ao art. 15 do Marco Civil da Internet.</p>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm"><strong>Fundamento Legal:</strong> Legítimo Interesse do Controlador - art. 7°, IX, da LGPD; Cumprimento de Obrigação Legal - art. 7°, Inciso II da LGPD.</p>
            </div>

            <div className="bg-zinc-50 dark:bg-[#111] border border-zinc-200 dark:border-white/10 rounded-xl p-5">
              <h4 className="font-bold text-zinc-900 dark:text-white mb-2">Finalidade: Comunicações e Marketing</h4>
              <p className="mb-2"><strong>Dados Coletados:</strong> Nome, e-mail e telefone.</p>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm"><strong>Fundamento Legal:</strong> Consentimento do Titular - art. 7°, I da LGPD.</p>
            </div>
          </div>

          <p>
            <strong>1.2.</strong> Para usuários que optam por realizar a assinatura de planos pagos, os dados requeridos relacionados à cobrança (dados de cartão de crédito e endereço de cobrança) não são armazenados pela Scale Drop.
          </p>
          <p>
            <strong>1.3.</strong> A Plataforma armazena dados de métricas vitais para a análise e otimização do desempenho das operações de seus respectivos Usuários. Isso inclui, mas não se limita a, dados de vendas realizadas nas plataformas onde o compartilhamento de dados é realizado pelo Usuário, além de gastos com anúncios em Plataformas de Gerenciadores de Anúncios.
          </p>
          <p>
            <strong>1.4.</strong> Em virtude de sua atividade, a Scale Drop atua como Operadora de Dados no que toca aos Dados de Terceiros coletados pelo Usuário (através de outras plataformas, gateways e redes sociais), sendo referidos dados comunicados à Plataforma Scale Drop automaticamente pelos sistemas de webhooks e APIs vinculados pelo próprio Usuário. Isso significa que a Scale Drop tratará referidos Dados Pessoais por conta e ordem do Usuário, o qual figurará neste caso como o Controlador de Dados.
          </p>
          <p>
            <strong>1.5.</strong> Em atenção à segurança e privacidade dos dados, a Scale Drop não coleta, recebe ou mantém em guarda dados sensíveis dos Usuários ou de terceiros. Caso tais dados sejam recebidos inadvertidamente de plataformas terceiras, eles são imediatamente excluídos.
          </p>
          <p>
            <strong>1.6 a 1.8.</strong> Para aprimorar as campanhas e infraestrutura, a Scale Drop coleta métricas e informações recebidas via webhook de plataformas de vendas parceiras sobre o cliente final (como CPF/CNPJ, e-mail, telefone, IP). Destas informações, apenas o e-mail do cliente final é armazenado em nosso banco de dados; as demais podem ser utilizadas para o repasse e otimização (ex.: reenvio ao Facebook), não responsabilizando a Scale Drop pela precisão das informações imputadas por terceiros.
          </p>
          <p>
            <strong>1.9 a 1.11.</strong> A Scale Drop compromete-se a usar os dados para os fins especificados, em conformidade com as legislações. Em exigência do art. 15 do Marco Civil da Internet (Lei n° 12.965/14), logs de ações são guardados por no mínimo 6 (seis) meses sob um identificador único (ID), classificados como temporários e excluídos posteriormente, salvo obrigação legal.
          </p>

          {/* 2. DIREITOS DO USUÁRIO */}
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mt-10 mb-4">
            2. DIREITOS DO USUÁRIO
          </h2>
          <p>
            <strong>2.1.</strong> Conforme dispõe o art. 18 da Lei Geral de Proteção de Dados (LGPD), pessoas físicas possuem o direito de confirmação da existência de tratamento, acesso, correção, anonimização, bloqueio ou eliminação de dados, portabilidade, revogação do consentimento, entre outros assegurados por lei.
          </p>
          <p>
            <strong>2.2 e 2.3.</strong> Para exercer seus direitos frente à Scale Drop, o Titular deverá comunicar o Encarregado de Proteção de Dados. A Scale Drop compromete-se a responder em até 2 (dois) dias úteis.
          </p>

          {/* 3. ARMAZENAMENTO */}
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mt-10 mb-4">
            3. FORMA E PRAZO DE ARMAZENAMENTO DOS DADOS
          </h2>
          <p>
            <strong>3.1 a 3.3.</strong> Os dados serão removidos de forma automática após sua utilização para os propósitos identificados. Em caso de encerramento da conta, a Scale Drop se compromete a excluir os Dados associados após um período de 60 dias, retendo somente os imprescindíveis para cumprir obrigações jurídicas, regulamentações, prevenção a fraudes ou defesa legal.
          </p>

          {/* 4. SEGURANÇA E COMPARTILHAMENTO */}
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mt-10 mb-4">
            4. SEGURANÇA DE DADOS E COMPARTILHAMENTO
          </h2>
          <p>
            <strong>4.1 e 4.2.</strong> Todos os dados são assegurados com protocolos de segurança e criptografia padrão. A Scale Drop implementa medidas tecnológicas avançadas, mecanismos robustos contra invasões, gerenciamento rigoroso de acessos internos e treinamentos contínuos de seus colaboradores.
          </p>
          <p>
            <strong>4.3 a 4.6.</strong> A Scale Drop operará com uso compartilhado de dados estritamente para otimização das funcionalidades contratadas, integrações tecnológicas solicitadas, obrigações legais, auditorias ou prevenção a fraudes. A plataforma não compartilhará Dados do Usuário com terceiros sem anuência, exceto nas hipóteses legais descritas.
          </p>

          {/* 5. COOKIES */}
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mt-10 mb-4">
            5. POLÍTICA DE COOKIES E DADOS DE NAVEGAÇÃO
          </h2>
          <p>
            <strong>5.1.</strong> Utilizamos informações coletadas automaticamente via cookies para: personalizar o Serviço; fornecer conteúdo; analisar a eficácia das atividades da plataforma; monitorar métricas agregadas de uso; e rastrear integrações funcionais no site.
          </p>

          {/* 6. ALTERAÇÕES */}
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mt-10 mb-4">
            6. ALTERAÇÃO DA POLÍTICA DE PRIVACIDADE
          </h2>
          <p>
            <strong>6.1 a 6.3.</strong> A Scale Drop reserva-se o direito de modificar esta Política de Privacidade a qualquer tempo para adequação à legislação vigente. Os Usuários serão informados via plataforma ou e-mail registrado. O uso contínuo da Plataforma importará no aceite integral à nova Política.
          </p>

          {/* 7. MENORES */}
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mt-10 mb-4">
            7. DA PRIVACIDADE DE MENORES
          </h2>
          <p>
            <strong>7.1 a 7.3.</strong> Nosso Serviço não é projetado para indivíduos menores de 18 anos. Não coletamos propositalmente informações de menores. Caso um responsável detecte conta criada por menor, deverá contatar <strong>[contato@scaledrop.com.br]</strong> para exclusão dos dados.
          </p>

          {/* 8. ENCARREGADO */}
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mt-10 mb-4">
            8. ENCARREGADO DE DADOS
          </h2>
          <p>
            <strong>8.1.</strong> O responsável (DPO) pelo tratamento de dados pessoais, conforme estabelecido nesta Política, é o(a) Sr(a). <strong>[NOME DO ENCARREGADO (DPO)]</strong>. Para esclarecer dúvidas ou fazer requerimentos, poderá ser contatado através do e-mail <strong>[contato@scaledrop.com.br]</strong>.
          </p>

          {/* 9. LEGISLAÇÃO */}
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mt-10 mb-4">
            9. LEGISLAÇÃO APLICÁVEL
          </h2>
          <p>
            <strong>9.1.</strong> Esta Política de Privacidade deverá ser interpretada de acordo com as leis vigentes na República Federativa do Brasil, sendo regida especificamente pelo Marco Civil da Internet (Lei n° 12.965/14) e pela Lei Geral de Proteção de Dados (Lei n° 13.709/18).
          </p>
        </div>
      </div>
    </div>
  );
}