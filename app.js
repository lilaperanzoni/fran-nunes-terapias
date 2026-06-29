// =============================================
// FRAN NUNES TERAPIAS — APP.JS
// Lógica completa do site + Admin Dashboard
// =============================================

// ---- SUPABASE CONFIG ----
// IMPORTANTE: Substitua pelas suas credenciais Supabase
const SUPABASE_URL = 'https://SEU_PROJETO.supabase.co';
const SUPABASE_KEY = 'SUA_CHAVE_ANON_PUBLICA';

let supabaseClient = null;
let currentClientId = null;
let isAuthenticated = false;

// Admin credentials (em produção, use autenticação via Supabase Auth)
const ADMIN_USER = 'frannunes';
const ADMIN_PASS = 'fran2026@terapias';

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
  initSupabase();
  initNavbar();
  initBriefingForm();
  initAdminLogin();
  initHamburger();
  initScrollAnimations();
});

// ---- SUPABASE INIT ----
function initSupabase() {
  try {
    if (typeof supabase !== 'undefined') {
      supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      console.log('Supabase inicializado');
    }
  } catch(e) {
    console.warn('Supabase não disponível, usando localStorage como fallback');
  }
}

// ---- NAVBAR ----
function initNavbar() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      navbar.style.boxShadow = '0 4px 30px rgba(61,43,31,0.15)';
    } else {
      navbar.style.boxShadow = '0 2px 20px rgba(61,43,31,0.08)';
    }
  });

  // Smooth scroll para links de navegação
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const navHeight = navbar.offsetHeight;
        const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top: targetTop, behavior: 'smooth' });
        // Fechar menu mobile
        document.querySelector('.nav-links')?.classList.remove('open');
      }
    });
  });
}

// ---- HAMBURGER ----
function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger) {
    hamburger.addEventListener('click', function() {
      navLinks.classList.toggle('open');
    });
  }
}

// ---- SCROLL ANIMATIONS ----
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.servico-card, .depoimento-card, .kpi-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// ---- BRIEFING FORM ----
function initBriefingForm() {
  const form = document.getElementById('briefing-form');
  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = form.querySelector('.btn-submit');
    const feedback = document.getElementById('form-feedback');
    
    btn.textContent = '⏳ Enviando...';
    btn.disabled = true;

    const formData = new FormData(form);
    const servicos = [];
    form.querySelectorAll('input[name="servico"]:checked').forEach(cb => servicos.push(cb.value));

    const clienteData = {
      nome: formData.get('nome'),
      data_nascimento: formData.get('data_nascimento'),
      email: formData.get('email'),
      whatsapp: formData.get('whatsapp'),
      cidade: formData.get('cidade'),
      profissao: formData.get('profissao'),
      motivo: formData.get('motivo'),
      dores: formData.get('dores'),
      sonhos: formData.get('sonhos'),
      historico_terapeutico: formData.get('historico_terapeutico'),
      saude: formData.get('saude'),
      espiritualidade: formData.get('espiritualidade'),
      origem: formData.get('origem'),
      servicos: servicos.join(', '),
      observacoes: formData.get('observacoes'),
      status: 'ativo',
      data_cadastro: new Date().toISOString()
    };

    try {
      const success = await salvarCliente(clienteData);
      if (success) {
        feedback.textContent = '✨ Cadastro realizado com sucesso! Fran entrará em contato em breve pelo WhatsApp.';
        feedback.className = 'form-feedback success';
        form.reset();
      } else {
        throw new Error('Erro ao salvar');
      }
    } catch(err) {
      feedback.textContent = '❌ Ops! Houve um erro. Por favor, entre em contato via WhatsApp.';
      feedback.className = 'form-feedback error';
    }

    btn.textContent = '✨ Enviar Meu Cadastro';
    btn.disabled = false;
  });
}

// ---- SALVAR CLIENTE (Supabase ou localStorage) ----
async function salvarCliente(dados) {
  if (supabaseClient) {
    const { error } = await supabaseClient.from('clientes').insert([dados]);
    if (error) { console.error(error); return false; }
    return true;
  } else {
    // Fallback: localStorage
    const clientes = JSON.parse(localStorage.getItem('fn_clientes') || '[]');
    dados.id = Date.now().toString();
    clientes.push(dados);
    localStorage.setItem('fn_clientes', JSON.stringify(clientes));
    return true;
  }
}

// ---- ADMIN LOGIN ----
function initAdminLogin() {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const user = document.getElementById('admin-user').value;
    const pass = document.getElementById('admin-pass').value;
    const feedback = document.getElementById('login-feedback');

    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      isAuthenticated = true;
      document.getElementById('admin-login-box').classList.add('hidden');
      document.getElementById('admin-dashboard').classList.remove('hidden');
      sessionStorage.setItem('fn_auth', 'true');
      initDashboard();
    } else {
      feedback.textContent = '❌ Usuário ou senha incorretos.';
      feedback.className = 'form-feedback error';
    }
  });

  // Auto-login se sessão existir
  if (sessionStorage.getItem('fn_auth') === 'true') {
    isAuthenticated = true;
    document.getElementById('admin-login-box')?.classList.add('hidden');
    document.getElementById('admin-dashboard')?.classList.remove('hidden');
    initDashboard();
  }

  // Logout
  document.getElementById('logout-btn')?.addEventListener('click', function() {
    isAuthenticated = false;
    sessionStorage.removeItem('fn_auth');
    document.getElementById('admin-login-box').classList.remove('hidden');
    document.getElementById('admin-dashboard').classList.add('hidden');
  });
}

// ---- DASHBOARD ----
function initDashboard() {
  initDashboardTabs();
  loadKPIs();
  loadClientes();
  loadPagamentos();
  initCharts();
  initKPISemanal();
  initPagamentoForm();
  initRelatorios();
}

// ---- DASHBOARD TABS ----
function initDashboardTabs() {
  document.querySelectorAll('.dash-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      const tabId = this.dataset.tab;
      document.querySelectorAll('.dash-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
      this.classList.add('active');
      document.getElementById('tab-' + tabId)?.classList.remove('hidden');
    });
  });
}

// ---- LOAD KPIs ----
async function loadKPIs() {
  const clientes = await getClientes();
  const pagamentos = getPagamentos();
  
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  const ativos = clientes.filter(c => c.status === 'ativo');
  const novosDoMes = clientes.filter(c => {
    const d = new Date(c.data_cadastro);
    return d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
  });

  const receitaMes = pagamentos
    .filter(p => {
      const d = new Date(p.data);
      return d.getMonth() === mesAtual && d.getFullYear() === anoAtual && p.status === 'pago';
    })
    .reduce((acc, p) => acc + parseFloat(p.valor || 0), 0);

  const sessoesMes = parseInt(localStorage.getItem('fn_sessoes_mes') || '0');
  const retencao = clientes.length > 0 ? Math.round((ativos.length / clientes.length) * 100) : 0;

  // Atualizar KPI cards
  document.getElementById('kpi-total-clientes').textContent = clientes.length;
  document.getElementById('kpi-ativos').textContent = ativos.length;
  document.getElementById('kpi-receita').textContent = 'R$ ' + receitaMes.toFixed(2).replace('.', ',');
  document.getElementById('kpi-sessoes').textContent = sessoesMes;
  document.getElementById('kpi-novos').textContent = novosDoMes.length;
  document.getElementById('kpi-retencao').textContent = retencao + '%';

  // Metas (baseadas no Plano de Ação Estratégico)
  const metaReceita = 5000;
  const metaClientes = 8;
  const metaSessoes = 20;

  updateProgress('progress-receita', 'meta-receita-pct', receitaMes, metaReceita, 'R$');
  updateProgress('progress-clientes', 'meta-clientes-pct', novosDoMes.length, metaClientes);
  updateProgress('progress-sessoes', 'meta-sessoes-pct', sessoesMes, metaSessoes);
}

function updateProgress(barId, textId, atual, meta, prefix = '') {
  const pct = Math.min(Math.round((atual / meta) * 100), 100);
  const bar = document.getElementById(barId);
  const text = document.getElementById(textId);
  if (bar) bar.style.width = pct + '%';
  if (text) text.textContent = pct + '% da meta (' + prefix + ' ' + atual + ' / ' + meta + ')';
}

// ---- CHARTS ----
function initCharts() {
  const ctxReceita = document.getElementById('chart-receita');
  const ctxServicos = document.getElementById('chart-servicos');
  
  if (ctxReceita) {
    const pagamentos = getPagamentos();
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    const hoje = new Date();
    const dados = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const total = pagamentos
        .filter(p => {
          const pd = new Date(p.data);
          return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear() && p.status === 'pago';
        })
        .reduce((acc, p) => acc + parseFloat(p.valor || 0), 0);
      dados.push(total);
    }

    new Chart(ctxReceita, {
      type: 'line',
      data: {
        labels: meses,
        datasets: [{
          label: 'Receita (R$)',
          data: dados,
          borderColor: '#C17B4E',
          backgroundColor: 'rgba(193,123,78,0.1)',
          tension: 0.4, fill: true, pointRadius: 5,
          pointBackgroundColor: '#C17B4E'
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  if (ctxServicos) {
    const clientes = JSON.parse(localStorage.getItem('fn_clientes') || '[]');
    const servicoCount = {};
    clientes.forEach(c => {
      if (c.servicos) {
        c.servicos.split(', ').forEach(s => {
          servicoCount[s] = (servicoCount[s] || 0) + 1;
        });
      }
    });

    new Chart(ctxServicos, {
      type: 'doughnut',
      data: {
        labels: Object.keys(servicoCount).length > 0 ? Object.keys(servicoCount) : ['Sem dados'],
        datasets: [{
          data: Object.values(servicoCount).length > 0 ? Object.values(servicoCount) : [1],
          backgroundColor: ['#C17B4E', '#B8954A', '#9E5E35', '#4A7C59', '#3D2B1F', '#888']
        }]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });
  }
}

// ---- KPI SEMANAL ----
function initKPISemanal() {
  const btn = document.getElementById('salvar-kpis');
  if (!btn) return;

  // Carregar valores salvos
  const kpiData = JSON.parse(localStorage.getItem('fn_kpi_semanal') || '{}');
  document.querySelectorAll('.kpi-input').forEach(input => {
    if (kpiData[input.dataset.kpi]) {
      input.value = kpiData[input.dataset.kpi];
    }
  });

  btn.addEventListener('click', function() {
    const data = {};
    document.querySelectorAll('.kpi-input').forEach(input => {
      data[input.dataset.kpi] = input.value;
    });
    localStorage.setItem('fn_kpi_semanal', JSON.stringify(data));
    localStorage.setItem('fn_sessoes_mes', data.sessoes_sem || 0);
    alert('✅ KPIs salvos com sucesso!');
    loadKPIs();
  });
}

// ---- LOAD CLIENTES ----
async function loadClientes() {
  const clientes = await getClientes();
  const lista = document.getElementById('lista-clientes');
  if (!lista) return;

  if (clientes.length === 0) {
    lista.innerHTML = '<p class="loading-msg">Nenhum cliente cadastrado ainda.</p>';
    return;
  }

  lista.innerHTML = clientes.map(c => `
    <div class="cliente-card" data-id="${c.id}" onclick="abrirModalCliente('${c.id}')">
      <h4>${c.nome}</h4>
      <p>📧 ${c.email || 'Não informado'}</p>
      <p>📱 ${c.whatsapp || 'Não informado'}</p>
      <p>📍 ${c.cidade || 'Não informada'}</p>
      <p>🎯 ${c.servicos || 'Não selecionado'}</p>
      <span class="tag ${c.status === 'ativo' ? 'tag-ativo' : 'tag-inativo'}">${c.status || 'ativo'}</span>
    </div>
  `).join('');

  // Preencher select de clientes no form de pagamento
  const select = document.getElementById('pag-cliente');
  if (select) {
    select.innerHTML = clientes.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
  }

  // Busca de clientes
  const busca = document.getElementById('busca-cliente');
  if (busca) {
    busca.addEventListener('input', function() {
      const termo = this.value.toLowerCase();
      document.querySelectorAll('.cliente-card').forEach(card => {
        const nome = card.querySelector('h4').textContent.toLowerCase();
        card.style.display = nome.includes(termo) ? '' : 'none';
      });
    });
  }
}

async function getClientes() {
  if (supabaseClient) {
    const { data, error } = await supabaseClient.from('clientes').select('*');
    if (error) { console.error(error); return []; }
    return data || [];
  }
  return JSON.parse(localStorage.getItem('fn_clientes') || '[]');
}

// ---- MODAL CLIENTE ----
async function abrirModalCliente(id) {
  const clientes = await getClientes();
  const cliente = clientes.find(c => c.id == id || c.id == parseInt(id));
  if (!cliente) return;

  currentClientId = id;
  document.getElementById('modal-nome-cliente').textContent = cliente.nome;
  document.getElementById('modal-cliente').classList.remove('hidden');

  // Preencher briefing
  const briefingDiv = document.getElementById('briefing-detalhes');
  briefingDiv.innerHTML = `
    <div class="briefing-view">
      <h4>Informações Pessoais</h4>
      <p><strong>Email:</strong> ${cliente.email || '—'}</p>
      <p><strong>WhatsApp:</strong> ${cliente.whatsapp || '—'}</p>
      <p><strong>Cidade:</strong> ${cliente.cidade || '—'}</p>
      <p><strong>Profissão:</strong> ${cliente.profissao || '—'}</p>
      <p><strong>Data de Nascimento:</strong> ${cliente.data_nascimento || '—'}</p>
      <hr>
      <h4>Jornada</h4>
      <p><strong>Motivo:</strong> ${cliente.motivo || '—'}</p>
      <p><strong>Dores:</strong> ${cliente.dores || '—'}</p>
      <p><strong>Sonhos:</strong> ${cliente.sonhos || '—'}</p>
      <hr>
      <h4>Saúde & Espiritualidade</h4>
      <p><strong>Histórico Terapêutico:</strong> ${cliente.historico_terapeutico || '—'}</p>
      <p><strong>Saúde:</strong> ${cliente.saude || '—'}</p>
      <p><strong>Espiritualidade:</strong> ${cliente.espiritualidade || '—'}</p>
      <hr>
      <h4>Interesse</h4>
      <p><strong>Serviço:</strong> ${cliente.servicos || '—'}</p>
      <p><strong>Como conheceu:</strong> ${cliente.origem || '—'}</p>
      <p><strong>Obs:</strong> ${cliente.observacoes || '—'}</p>
      <p><strong>Cadastrado em:</strong> ${cliente.data_cadastro ? new Date(cliente.data_cadastro).toLocaleDateString('pt-BR') : '—'}</p>
    </div>
  `;

  // Carregar evoluções
  carregarEvolucoes(id);
  carregarSessoes(id);

  // Modal tabs
  document.querySelectorAll('.modal-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.modal-tab-content').forEach(c => c.classList.add('hidden'));
      this.classList.add('active');
      document.getElementById('mtab-' + this.dataset.mtab)?.classList.remove('hidden');
    });
  });
}

function carregarEvolucoes(clienteId) {
  const evolucoes = JSON.parse(localStorage.getItem('fn_evolucoes_' + clienteId) || '[]');
  const div = document.getElementById('historico-evolucao');
  if (!div) return;
  div.innerHTML = evolucoes.length > 0
    ? evolucoes.slice().reverse().map(e => `
        <div class="evolucao-entrada">
          <div class="data">${new Date(e.data).toLocaleDateString('pt-BR', {day:'2-digit',month:'long',year:'numeric'})}</div>
          <p>${e.texto}</p>
        </div>
      `).join('')
    : '<p class="loading-msg">Nenhuma evolução registrada.</p>';
}

function carregarSessoes(clienteId) {
  const sessoes = JSON.parse(localStorage.getItem('fn_sessoes_' + clienteId) || '[]');
  const div = document.getElementById('historico-sessoes');
  if (!div) return;
  div.innerHTML = sessoes.length > 0
    ? sessoes.slice().reverse().map(s => `
        <div class="evolucao-entrada">
          <div class="data">${new Date(s.data).toLocaleDateString('pt-BR')} — ${s.tipo}</div>
          <p>${s.obs || 'Sem observações'}</p>
        </div>
      `).join('')
    : '<p class="loading-msg">Nenhuma sessão registrada.</p>';
}

// Salvar evolução
document.getElementById('salvar-evolucao')?.addEventListener('click', function() {
  const texto = document.getElementById('nova-evolucao').value.trim();
  if (!texto || !currentClientId) return;
  const evolucoes = JSON.parse(localStorage.getItem('fn_evolucoes_' + currentClientId) || '[]');
  evolucoes.push({ data: new Date().toISOString(), texto });
  localStorage.setItem('fn_evolucoes_' + currentClientId, JSON.stringify(evolucoes));
  document.getElementById('nova-evolucao').value = '';
  carregarEvolucoes(currentClientId);
  alert('✅ Evolução registrada!');
});

// Salvar sessão
document.getElementById('salvar-sessao')?.addEventListener('click', function() {
  if (!currentClientId) return;
  const data = document.getElementById('sessao-data').value;
  const tipo = document.getElementById('sessao-tipo').value;
  const obs = document.getElementById('sessao-obs').value;
  if (!data) { alert('Informe a data da sessão'); return; }
  const sessoes = JSON.parse(localStorage.getItem('fn_sessoes_' + currentClientId) || '[]');
  sessoes.push({ data, tipo, obs });
  localStorage.setItem('fn_sessoes_' + currentClientId, JSON.stringify(sessoes));
  document.getElementById('sessao-data').value = '';
  document.getElementById('sessao-obs').value = '';
  carregarSessoes(currentClientId);
  alert('✅ Sessão registrada!');
});

// Fechar modal
document.getElementById('modal-close')?.addEventListener('click', function() {
  document.getElementById('modal-cliente').classList.add('hidden');
  currentClientId = null;
});

// Fechar modal ao clicar fora
document.getElementById('modal-cliente')?.addEventListener('click', function(e) {
  if (e.target === this) {
    this.classList.add('hidden');
    currentClientId = null;
  }
});

// ---- PAGAMENTOS ----
function getPagamentos() {
  return JSON.parse(localStorage.getItem('fn_pagamentos') || '[]');
}

function initPagamentoForm() {
  const btnNovo = document.getElementById('novo-pagamento');
  const formPag = document.getElementById('form-pagamento');
  
  btnNovo?.addEventListener('click', function() {
    formPag?.classList.toggle('hidden');
    // Set today's date
    const dataInput = document.getElementById('pag-data');
    if (dataInput && !dataInput.value) {
      dataInput.value = new Date().toISOString().split('T')[0];
    }
  });

  document.getElementById('salvar-pagamento')?.addEventListener('click', function() {
    const clienteId = document.getElementById('pag-cliente').value;
    const servico = document.getElementById('pag-servico').value;
    const valor = document.getElementById('pag-valor').value;
    const data = document.getElementById('pag-data').value;
    const status = document.getElementById('pag-status').value;
    const metodo = document.getElementById('pag-metodo').value;

    if (!valor || !data) { alert('Preencha valor e data'); return; }

    const clientes = JSON.parse(localStorage.getItem('fn_clientes') || '[]');
    const cliente = clientes.find(c => c.id == clienteId);

    const pagamentos = getPagamentos();
    pagamentos.push({
      id: Date.now().toString(),
      clienteId, clienteNome: cliente?.nome || 'Desconhecido',
      servico, valor: parseFloat(valor), data, status, metodo,
      criadoEm: new Date().toISOString()
    });
    localStorage.setItem('fn_pagamentos', JSON.stringify(pagamentos));
    
    document.getElementById('pag-servico').value = '';
    document.getElementById('pag-valor').value = '';
    formPag?.classList.add('hidden');
    loadPagamentos();
    loadKPIs();
    alert('✅ Pagamento registrado!');
  });
}

function loadPagamentos() {
  const pagamentos = getPagamentos();
  const tbody = document.getElementById('tabela-pag-body');
  if (!tbody) return;

  if (pagamentos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="loading-msg">Nenhum pagamento registrado.</td></tr>';
    return;
  }

  tbody.innerHTML = pagamentos.slice().reverse().map(p => `
    <tr>
      <td>${p.clienteNome || '—'}</td>
      <td>${p.servico || '—'}</td>
      <td>R$ ${parseFloat(p.valor).toFixed(2).replace('.', ',')}</td>
      <td>${p.data ? new Date(p.data + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}</td>
      <td><span class="badge-${p.status}">${p.status}</span></td>
      <td>${p.metodo || '—'}</td>
    </tr>
  `).join('');
}

// ---- RELATÓRIOS ----
function initRelatorios() {
  document.getElementById('gerar-relatorio-mensal')?.addEventListener('click', async function() {
    const mes = document.getElementById('rel-mes').value;
    if (!mes) { alert('Selecione um mês'); return; }
    
    const [ano, mesNum] = mes.split('-').map(Number);
    const clientes = await getClientes();
    const pagamentos = getPagamentos();
    
    const novos = clientes.filter(c => {
      const d = new Date(c.data_cadastro);
      return d.getMonth() + 1 === mesNum && d.getFullYear() === ano;
    });
    
    const pagsMes = pagamentos.filter(p => {
      const d = new Date(p.data + 'T00:00:00');
      return d.getMonth() + 1 === mesNum && d.getFullYear() === ano;
    });
    
    const receitaMes = pagsMes.filter(p => p.status === 'pago').reduce((a, p) => a + parseFloat(p.valor || 0), 0);
    const pendente = pagsMes.filter(p => p.status === 'pendente').reduce((a, p) => a + parseFloat(p.valor || 0), 0);

    const output = document.getElementById('relatorio-output');
    output.classList.remove('hidden');
    output.innerHTML = `
      <h3>📊 Relatório Mensal — ${mes}</h3>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:20px 0;">
        <div style="background:#f0f9ff;padding:20px;border-radius:12px;text-align:center;">
          <div style="font-size:32px;font-weight:700;color:#C17B4E;">${novos.length}</div>
          <div style="font-size:13px;color:#666;">Novos Clientes</div>
        </div>
        <div style="background:#f0fdf4;padding:20px;border-radius:12px;text-align:center;">
          <div style="font-size:32px;font-weight:700;color:#4A7C59;">R$ ${receitaMes.toFixed(2).replace('.', ',')}</div>
          <div style="font-size:13px;color:#666;">Receita Realizada</div>
        </div>
        <div style="background:#fff7ed;padding:20px;border-radius:12px;text-align:center;">
          <div style="font-size:32px;font-weight:700;color:#B8954A;">R$ ${pendente.toFixed(2).replace('.', ',')}</div>
          <div style="font-size:13px;color:#666;">Pendente</div>
        </div>
      </div>
      <h4>Novos Clientes no Mês</h4>
      ${novos.length > 0 ? novos.map(c => `<p>• ${c.nome} — ${c.servicos || 'Serviço não especificado'}</p>`).join('') : '<p>Nenhum cliente novo no período.</p>'}
      <h4 style="margin-top:16px;">Pagamentos do Mês</h4>
      ${pagsMes.length > 0 ? pagsMes.map(p => `<p>• ${p.clienteNome} — R$ ${parseFloat(p.valor).toFixed(2)} (${p.status})</p>`).join('') : '<p>Nenhum pagamento no período.</p>'}
      <div style="margin-top:24px;padding:16px;background:#f8f4f0;border-radius:8px;">
        <p style="font-size:12px;color:#888;">Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
      </div>
    `;
  });

  document.getElementById('gerar-relatorio-financeiro')?.addEventListener('click', async function() {
    const pagamentos = getPagamentos();
    const totalPago = pagamentos.filter(p => p.status === 'pago').reduce((a, p) => a + parseFloat(p.valor || 0), 0);
    const totalPendente = pagamentos.filter(p => p.status === 'pendente').reduce((a, p) => a + parseFloat(p.valor || 0), 0);
    
    const output = document.getElementById('relatorio-output');
    output.classList.remove('hidden');
    output.innerHTML = `
      <h3>💰 Relatório Financeiro Completo</h3>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin:20px 0;">
        <div style="background:#f0fdf4;padding:24px;border-radius:12px;text-align:center;">
          <div style="font-size:36px;font-weight:700;color:#4A7C59;">R$ ${totalPago.toFixed(2).replace('.', ',')}</div>
          <div style="font-size:14px;color:#666;">Total Recebido</div>
        </div>
        <div style="background:#fff7ed;padding:24px;border-radius:12px;text-align:center;">
          <div style="font-size:36px;font-weight:700;color:#B8954A;">R$ ${totalPendente.toFixed(2).replace('.', ',')}</div>
          <div style="font-size:14px;color:#666;">Total Pendente</div>
        </div>
      </div>
      <h4>Histórico de Pagamentos (${pagamentos.length} registros)</h4>
      ${pagamentos.slice().reverse().map(p => `
        <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #eee;">
          <span>${p.clienteNome}</span>
          <span>R$ ${parseFloat(p.valor).toFixed(2)}</span>
          <span>${p.data ? new Date(p.data + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}</span>
          <span class="badge-${p.status}">${p.status}</span>
        </div>
      `).join('') || '<p>Nenhum registro.</p>'}
    `;
  });

  document.getElementById('gerar-relatorio-evolucao')?.addEventListener('click', async function() {
    const clientes = await getClientes();
    const output = document.getElementById('relatorio-output');
    output.classList.remove('hidden');
    output.innerHTML = `
      <h3>📈 Relatório de Evolução dos Clientes</h3>
      ${clientes.map(c => {
        const evolucoes = JSON.parse(localStorage.getItem('fn_evolucoes_' + c.id) || '[]');
        return `
          <div style="background:#f8f4f0;border-radius:12px;padding:20px;margin-bottom:16px;">
            <h4>${c.nome} <span style="font-size:12px;color:#888;">(${evolucoes.length} registros)</span></h4>
            ${evolucoes.length > 0 
              ? evolucoes.slice(-3).map(e => `<p style="font-size:14px;color:#666;margin:8px 0;">📌 ${new Date(e.data).toLocaleDateString('pt-BR')}: ${e.texto.substring(0,120)}...`).join('')
              : '<p style="color:#999;font-size:14px;">Nenhuma evolução registrada</p>'}
          </div>
        `;
      }).join('') || '<p>Nenhum cliente cadastrado.</p>'}
    `;
  });
                          }
