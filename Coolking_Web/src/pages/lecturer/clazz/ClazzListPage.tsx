import React, { useState, useEffect } from 'react';
import HeaderLeCpn from '../../../components/lecturer/HeaderLeCpn';
import FooterLeCpn from '../../../components/lecturer/FooterLeCpn';

const ClazzListPage: React.FC = () => {

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <HeaderLeCpn />

            <main className="flex-1 max-w-7xl mx-auto px-3 md:px-6 py-4 md:py-8 w-full">
                
            </main>

            <FooterLeCpn />
        </div>
    );
};

export default ClazzListPage;
