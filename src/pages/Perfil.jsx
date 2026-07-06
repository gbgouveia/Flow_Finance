import React, { useState, useEffect } from 'react';
import { User, Shield, CreditCard, Save, UploadCloud } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import api from '../services/api';

export default function Perfil() {
  const { user, fetchUserProfile } = useAuth();
  
  const [profile, setProfile] = useState({
    name: user?.username || 'Gabriel Gouveia',
    email: user?.email || 'gabriel.gouveia@flowfinance.com',
    role: user?.cargo || 'CEO & Founder',
    company: user?.empresa || 'Flow Corp',
    telefone: user?.telefone || '',
  });
  
  const [avatar, setAvatar] = useState(user?.foto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256&h=256');

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.username || '',
        email: user.email || '',
        role: user.cargo || '',
        company: user.empresa || '',
        telefone: user.telefone || '',
      });
      if (user.foto) {
        setAvatar(user.foto);
      }
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      username: profile.name,
      telefone: profile.telefone,
      cargo: profile.role,
      empresa: profile.company
    };

    toast.promise(
      api.patch('auth/me/', payload).then(async () => {
        await fetchUserProfile();
      }),
      {
        loading: 'Salvando alterações...',
        success: 'Perfil atualizado com sucesso!',
        error: 'Erro ao salvar.',
      }
    );
  };

  const handleAvatarChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('foto', file);

      try {
        const response = await api.patch('auth/me/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setAvatar(response.data.foto);
        await fetchUserProfile();
        toast.success('Foto de perfil atualizada com sucesso!');
      } catch (error) {
        console.error(error);
        toast.error('Erro ao atualizar foto de perfil.');
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 relative">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-border-custom pb-6">
        <h1 className="text-2xl font-extrabold font-sora tracking-tight text-gradient-purple-blue">
          Meu Perfil
        </h1>
        <p className="text-sm text-text-secondary">
          Gerencie suas informações cadastrais e dados corporativos no Flow Finance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Profile Card / Photo Upload */}
        <div className="lg:col-span-1">
          <Card className="flex flex-col items-center text-center p-8 gap-4">
            <div className="relative group cursor-pointer w-28 h-28 rounded-full overflow-hidden border border-border-custom hover:border-brand-purple transition-colors">
              <img
                src={avatar}
                alt="Profile Avatar"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-[10px] gap-1 font-semibold uppercase tracking-wider">
                <UploadCloud size={18} />
                <span>Alterar Foto</span>
                <input
                  type="file"
                  onChange={handleAvatarChange}
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <h3 className="font-bold text-base text-text-primary font-sora">{profile.name}</h3>
              <span className="text-xs text-text-secondary mt-0.5">{profile.role}</span>
              <span className="text-[10px] text-brand-purple font-semibold font-manrope bg-brand-purple/10 px-2 py-0.5 rounded-full mt-2 self-center">
                Plano Enterprise
              </span>
            </div>
            
            <div className="w-full border-t border-border-custom/50 pt-4 mt-2 flex flex-col gap-2.5 text-xs text-text-secondary text-left font-manrope">
              <div className="flex justify-between">
                <span>Membro desde</span>
                <span className="text-text-primary font-semibold">Jan/2025</span>
              </div>
              <div className="flex justify-between">
                <span>Empresa</span>
                <span className="text-text-primary font-semibold">{profile.company}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Edit Info Form */}
        <div className="lg:col-span-2">
          <Card className="flex flex-col gap-6">
            <h3 className="text-sm font-bold font-sora text-text-primary uppercase tracking-wider font-manrope flex items-center gap-2">
              <User size={16} className="text-brand-purple" />
              Dados Cadastrais
            </h3>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nome Completo"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
                <Input
                  label="E-mail Corporativo"
                  type="email"
                  value={profile.email}
                  disabled
                  wrapperClassName="opacity-60"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Cargo / Função"
                  value={profile.role}
                  onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                />
                <Input
                  label="Empresa"
                  value={profile.company}
                  onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Telefone / Contato"
                  value={profile.telefone}
                  onChange={(e) => setProfile({ ...profile, telefone: e.target.value })}
                />
              </div>

              <div className="flex justify-end border-t border-border-custom pt-4 mt-2">
                <Button type="submit" icon={Save}>
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </Card>

          {/* Subscriptions Card */}
          <Card className="mt-6 flex flex-col gap-4">
            <h3 className="text-sm font-bold font-sora text-text-primary uppercase tracking-wider font-manrope flex items-center gap-2">
              <CreditCard size={16} className="text-brand-blue" />
              Faturamento e Assinatura
            </h3>
            
            <div className="flex justify-between items-center text-xs border-b border-border-custom pb-3 font-manrope">
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-text-primary">Fatura Mensal Corporativa</span>
                <span className="text-text-secondary text-[10px]">Próximo vencimento em 15/07/2026</span>
              </div>
              <span className="text-text-primary font-bold">R$ 1.250,00 / mês</span>
            </div>

            <div className="flex justify-between items-center text-xs font-manrope">
              <span className="text-text-secondary">Método de pagamento padrão</span>
              <span className="text-text-primary font-medium flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 bg-brand-blue/10 text-brand-blue rounded text-[10px] font-bold">VISA</span>
                final 8421
              </span>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
