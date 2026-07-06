import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { TrendingUp, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/Input';
import PasswordInput from '../components/PasswordInput';
import Button from '../components/Button';
import Coins3D from '../components/Coins3D';

// Validation Schema with Zod
const loginSchema = z.object({
  email: z.string().min(1, 'E-mail é obrigatório').email('Formato de e-mail inválido'),
  password: z.string().min(6, 'A senha deve conter no mínimo 6 caracteres'),
  remember: z.boolean().optional(),
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await login(data.email, data.password, data.remember);
      navigate('/dashboard');
    } catch (err) {
      // Error handled by Toast inside login context
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 200 } },
  };

  return (
    <div className="min-h-screen w-full flex bg-bg-primary text-text-primary overflow-hidden relative">
      {/* Background ambient light overlay on form side */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-brand-purple/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Form Column - Left */}
      <div className="w-full lg:w-[45%] flex flex-col justify-between p-8 sm:p-12 xl:p-16 z-10 relative bg-bg-primary/80 backdrop-blur-md border-r border-border-custom/50">
        
        {/* Header Logo */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-brand-purple/10 rounded-xl text-brand-purple flex items-center justify-center">
            <TrendingUp size={20} />
          </div>
          <span className="font-bold font-sora text-base uppercase tracking-wider text-gradient-purple-blue">
            Flow Finance
          </span>
        </div>

        {/* Login Form Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="my-auto max-w-sm w-full mx-auto flex flex-col gap-6"
        >
          <div className="flex flex-col gap-2">
            <motion.h2
              variants={itemVariants}
              className="text-3xl font-extrabold font-sora tracking-tight text-text-primary"
            >
              Acesse sua conta
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-sm text-text-secondary"
            >
              Entre com suas credenciais para gerenciar seus ativos.
            </motion.p>
          </div>

          <motion.form
            variants={itemVariants}
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            {/* Email */}
            <Input
              label="E-mail Corporativo"
              type="email"
              icon={Mail}
              placeholder="exemplo@flowfinance.com"
              error={errors.email}
              {...register('email')}
            />

            {/* Password */}
            <PasswordInput
              label="Senha"
              placeholder="••••••••"
              error={errors.password}
              {...register('password')}
            />

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-xs mt-1">
              <label className="flex items-center gap-2 text-text-secondary hover:text-text-primary cursor-pointer transition-colors font-manrope">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border-custom bg-bg-card/50 text-brand-purple focus:ring-brand-purple/50 focus:ring-offset-0 focus:outline-none accent-brand-purple"
                  {...register('remember')}
                />
                Lembrar deste dispositivo
              </label>
              
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Instruções de redefinição enviadas para o e-mail informado (Simulado).');
                }}
                className="text-brand-purple hover:underline font-semibold font-manrope"
              >
                Esqueceu a senha?
              </a>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              isLoading={submitting}
              className="w-full mt-2 font-semibold"
              size="lg"
            >
              Entrar no Flow
            </Button>
          </motion.form>

          {/* Divider */}
          <motion.div variants={itemVariants} className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-border-custom"></div>
            <span className="flex-shrink mx-4 text-xs font-semibold text-text-secondary/50 uppercase tracking-widest font-manrope">ou continuar com</span>
            <div className="flex-grow border-t border-border-custom"></div>
          </motion.div>

          {/* Social Google Login */}
          <motion.div variants={itemVariants}>
            <Button
              variant="secondary"
              className="w-full flex items-center justify-center gap-2 font-semibold"
              onClick={() => {
                setSubmitting(true);
                setTimeout(() => {
                  login('demo.user@flowfinance.com', '123456');
                  navigate('/dashboard');
                  setSubmitting(false);
                }, 1000);
              }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              Google Workspace
            </Button>
          </motion.div>

          {/* Register Link */}
          <motion.p variants={itemVariants} className="text-center text-xs text-text-secondary font-manrope">
            Novo na plataforma?{' '}
            <a
              href="#register"
              onClick={(e) => {
                e.preventDefault();
                alert('O cadastro está fechado no momento. Use o login padrão ou continue com o Google.');
              }}
              className="text-brand-purple font-semibold hover:underline"
            >
              Criar Conta Corporativa
            </a>
          </motion.p>
        </motion.div>

        {/* Footer */}
        <div className="text-xs text-text-secondary/40 flex justify-between font-manrope">
          <span>&copy; {new Date().getFullYear()} Flow Corp.</span>
          <div className="flex gap-4">
            <a href="#terms" className="hover:underline">Termos</a>
            <a href="#privacy" className="hover:underline">Privacidade</a>
          </div>
        </div>
      </div>

      {/* R3F 3D Scene Column - Right */}
      <div className="hidden lg:block lg:flex-1 relative overflow-hidden">
        <Coins3D />
      </div>
    </div>
  );
}
