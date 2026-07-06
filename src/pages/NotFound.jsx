import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Compass } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-bg-primary text-text-primary p-4 relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-purple/10 blur-[130px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full text-center relative z-10"
      >
        <Card className="flex flex-col items-center justify-center p-8 gap-6 glass-panel">
          <div className="p-3 bg-brand-purple/10 rounded-2xl text-brand-purple flex items-center justify-center animate-bounce">
            <Compass size={32} />
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-6xl font-extrabold font-sora text-gradient-purple-blue tracking-tighter">
              404
            </h1>
            <h2 className="text-lg font-bold font-sora text-text-primary">
              Ruta não encontrada
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed max-w-xs mx-auto">
              A página que você está tentando acessar foi movida ou não existe no console Flow Finance.
            </p>
          </div>

          <Button
            icon={LayoutDashboard}
            onClick={() => navigate('/dashboard')}
            className="w-full font-semibold mt-2"
          >
            Voltar ao Dashboard
          </Button>
        </Card>
      </motion.div>

      {/* Decorative footer */}
      <div className="absolute bottom-6 text-[10px] text-text-secondary/20 font-mono">
        FLOW_ERR_ROUTE_RESOLVER_FAILED
      </div>
    </div>
  );
}
