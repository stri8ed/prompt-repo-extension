import {Fragment, PropsWithChildren, useEffect} from 'react';
import {Dialog, Transition} from '@headlessui/react';

export default function Modal({
    children,
    show = false,
    maxWidth = '2xl',
    closeable = true,
    onClose = () => {
    },
}: PropsWithChildren<{
    show: boolean;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'none';
    closeable?: boolean;
    onClose: CallableFunction;
}>) {
    const close = () => {
        if (closeable) {
            onClose();
        }
    };

    useEffect(() => {
        if(show) {
            const handleEscape = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    close();
                }
            };
            document.addEventListener('keydown', handleEscape);
            return () => {
                document.removeEventListener('keydown', handleEscape);
            };
        }
    }, [show]);

    const maxWidthClass = {
        sm: 'sm:max-w-sm',
        md: 'sm:max-w-md',
        lg: 'sm:max-w-lg',
        xl: 'sm:max-w-2xl',
        'none': 'container',
        '2xl': 'sm:max-w-2xl',
        '3xl': 'sm:max-w-3xl',

    }[maxWidth];

    return (
        <Transition show={show} as={Fragment} leave="duration-200">

            <Dialog
                as="div"
                id="modal"
                className="repo-prompt fixed inset-0  overflow-y-auto  px-4 py-6 sm:px-0  z-50  transform transition-all"
                onClose={close}
            >
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed  inset-0 bg-gray-500/75"/>
                </Transition.Child>
                <div className="fixed inset-0 overflow-y-auto">
                    <div
                        className="flex min-h-full items-center justify-center p-4 "
                    >
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel
                                className={`my-6 bg-white rounded-lg overflow-hidden shadow-xl transform transition-all w-full mx-auto ${maxWidthClass}`}
                            >
                                {children}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div></div>
            </Dialog>
        </Transition>
);
}
