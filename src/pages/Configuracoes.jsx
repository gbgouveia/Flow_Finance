import React, { useState } from 'react';
import { Settings, Shield, Bell, Network, Save, Terminal, Key } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

export default function Configuracoes() {
  const [fastApiConnected, setFastApiConnected] = useState(localStorage.getItem('flow-fastapi-connected') !== 'false');
  const [apiUrl, setApiUrl] = useState(localStorage.getItem('flow-api-url') || 'http://127.0.0.1:8000/api/');
  const [apiKey, setApiKey] = useState(localStorage.getItem('flow-api-key') || 'flow_sec_live_9a2b84fcde12');
  
  const [notifs, setNotifs] = useState({
    emailAlerts: true,
    limitExceed: true,
    weeklyReport: false,
  });

  const handleSaveSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('flow-api-url', apiUrl);
    localStorage.setItem('flow-api-key', apiKey);
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 800)),
      {
        loading: 'Salvando preferências...',
        success: 'Configurações salvas com sucesso! Recarregando...',
        error: 'Erro ao salvar.',
      }
    ).then(() => {
      setTimeout(() => {
        window.location.reload();
      }, 500);
    });
  };

  const handleToggleFastApi = () => {
    const nextVal = !fastApiConnected;
    setFastApiConnected(nextVal);
    localStorage.setItem('flow-fastapi-connected', nextVal ? 'true' : 'false');
    if (nextVal) {
      toast.success('Ambiente preparado para integração com backend!');
    } else {
      toast.error('Integração desativada (Mock local ativo).');
    }
  };

  return (
    <div className="flex flex-col gap-6 relative">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-border-custom pb-6">
        <h1 className="text-2xl font-extrabold font-sora tracking-tight text-brand-purple">
          Configurações
        </h1>
        <p className="text-sm text-text-secondary">
          Ajustes de segurança, integrações de APIs e chaves do desenvolvedor.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start font-manrope">
        
        {/* Integrations Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* FastAPI Card */}
          <Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Network className="text-brand-purple" size={18} />
                <h3 className="font-bold text-sm text-text-primary font-sora">FastAPI Sandbox</h3>
              </div>
              
              <button
                onClick={handleToggleFastApi}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer focus:outline-none ${
                  fastApiConnected
                    ? 'bg-brand-green/10 text-brand-green border border-brand-green/30'
                    : 'bg-white/5 text-text-secondary hover:text-text-primary border border-border-custom'
                }`}
              >
                {fastApiConnected ? 'Conectado' : 'Conectar'}
              </button>
            </div>
            
            <p className="text-xs text-text-secondary leading-relaxed">
              Toda a arquitetura do Flow Finance está estruturada para consumo via Axios. Ative esta opção para chavear os endpoints mockados para conexões reais com o backend FastAPI.
            </p>

            <div className="flex flex-col gap-4 mt-2">
              <Input
                label="API Endpoint URL"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="http://localhost:8000/api"
                disabled={!fastApiConnected}
                wrapperClassName={!fastApiConnected ? 'opacity-40' : ''}
              />
              
              <div className="relative">
                <Input
                  label="API Bearer Token"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Insira sua chave de autenticação..."
                  disabled={!fastApiConnected}
                  wrapperClassName={!fastApiConnected ? 'opacity-40' : ''}
                />
                <Key className="absolute right-3 bottom-3 text-text-secondary/40 w-4 h-4" />
              </div>
            </div>
          </Card>

          {/* User Notifications preferences */}
          <Card className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Bell className="text-brand-blue" size={18} />
              <h3 className="font-bold text-sm text-text-primary font-sora">Notificações do Sistema</h3>
            </div>
            
            <form onSubmit={handleSaveSettings} className="flex flex-col gap-4 mt-2">
              <label className="flex items-center gap-3 cursor-pointer hover:text-text-primary text-xs text-text-secondary transition-colors">
                <input
                  type="checkbox"
                  checked={notifs.emailAlerts}
                  onChange={(e) => setNotifs({ ...notifs, emailAlerts: e.target.checked })}
                  className="w-4 h-4 rounded border-border-custom bg-bg-card text-brand-purple focus:ring-0 accent-brand-purple cursor-pointer"
                />
                Receber alertas de faturamento Stripe por e-mail
              </label>

              <label className="flex items-center gap-3 cursor-pointer hover:text-text-primary text-xs text-text-secondary transition-colors">
                <input
                  type="checkbox"
                  checked={notifs.limitExceed}
                  onChange={(e) => setNotifs({ ...notifs, limitExceed: e.target.checked })}
                  className="w-4 h-4 rounded border-border-custom bg-bg-card text-brand-purple focus:ring-0 accent-brand-purple cursor-pointer"
                />
                Enviar avisos visuais ao atingir 90% dos orçamentos
              </label>

              <label className="flex items-center gap-3 cursor-pointer hover:text-text-primary text-xs text-text-secondary transition-colors">
                <input
                  type="checkbox"
                  checked={notifs.weeklyReport}
                  onChange={(e) => setNotifs({ ...notifs, weeklyReport: e.target.checked })}
                  className="w-4 h-4 rounded border-border-custom bg-bg-card text-brand-purple focus:ring-0 accent-brand-purple cursor-pointer"
                />
                Compilar relatórios consolidados em formato PDF semanalmente
              </label>

              <div className="flex justify-end border-t border-border-custom pt-4 mt-2">
                <Button type="submit" icon={Save}>
                  Salvar Preferências
                </Button>
              </div>
            </form>
          </Card>

        </div>

        {/* Sidebar Info Column */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card className="flex flex-col gap-4 bg-bg-secondary/20">
            <div className="flex items-center gap-2">
              <Shield className="text-brand-purple" size={16} />
              <h3 className="font-bold text-xs text-text-primary uppercase tracking-wider font-manrope">Segurança</h3>
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Sua sessão é mockada localmente em sua máquina utilizando os tokens e cookies de visualização do navegador para segurança de portfólio.
            </p>
            <div className="flex justify-between items-center text-[10px] text-text-secondary border-t border-border-custom pt-3 mt-1 font-mono">
              <span>Chaves Ativas</span>
              <span className="text-brand-green">1 Conectada</span>
            </div>
          </Card>
          
          <Card className="flex flex-col gap-4 bg-bg-secondary/20">
            <div className="flex items-center gap-2">
              <Terminal className="text-brand-purple" size={16} />
              <h3 className="font-bold text-xs text-text-primary uppercase tracking-wider font-manrope">Status API</h3>
            </div>
            <div className="flex flex-col gap-2.5 text-[11px] text-text-secondary font-mono">
              <div className="flex justify-between">
                <span>FastAPI Router</span>
                <span className={fastApiConnected ? 'text-brand-green font-bold' : 'text-brand-yellow font-bold'}>
                  {fastApiConnected ? 'IDLE / CONNECTED' : 'MOCKED LOCAL'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Versão do Client</span>
                <span>v1.0.0</span>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
