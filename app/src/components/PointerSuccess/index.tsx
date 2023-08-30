import React from 'react';
import { Layout } from 'antd';

const PointerSuccess = () => {
    return (
        <section className="vh-100 login" style={{ backgroundColor: '#1E1C22 !important' }}>
            <div className="container py-5 h-100">
                <div className="row d-flex justify-content-center align-items-center h-100">
                    <div className="col-12 col-md-8 col-lg-6 col-xl-5">
                        <div className="card shadow-2-strong" style={{ borderRadius: '1rem' }}>
                            <div className="card-body p-5 text-center">

                                <img style={{ height: '60px' }} src="/images/logo.svg" alt="Logo de QR4You"></img>

                                <h3 className='mt-2 title-txt'>Pointage effectué</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PointerSuccess;
