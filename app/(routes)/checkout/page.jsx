'use client'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowBigRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import GlobalApi from '@/app/_utils/GlobalApi';
import { toast } from 'sonner';
import Modal from './Modal'; // Adjust the import according to your project structure
import { Item } from '@radix-ui/react-dropdown-menu';
import { useRouter } from 'next/navigation';

function CheckOut() {
    const user = JSON.parse(sessionStorage.getItem('user'));
    const jwt = sessionStorage.getItem('jwt');
    const [totalCardItem, setTotalCardItem] = useState(0);
    const [cartItemsList, setCartItemsList] = useState([]);
    const [subtotal, setSubtotal] = useState(0);
    const [totalAmounts, setTotalAmounts] = useState(0);
    const [orderDetails, setOrderDetails] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [pincode, setPincode] = useState('');
    const [address, setAddress] = useState('');
      const router=useRouter();
    useEffect(() => {
        getCartItems();
    }, [user, jwt]);

    const getCartItems = async () => {
        if (user && user.id) {
            try {
                const cartItemList = await GlobalApi.getCartItems(user.id, jwt);
                setTotalCardItem(cartItemList?.length);
                setCartItemsList(cartItemList);
            } catch (error) {
                console.error("Error fetching cart items:", error);
            }
        }
    }

    useEffect(() => {
        let total = 0;
        cartItemsList.forEach(element => {
            total += element.amount;
        });

        setTotalAmounts((total * 0.9) + 40);
        setSubtotal(total);
    }, [cartItemsList]);

    const CalculateTotalAmount = () => {
        const taxrate = subtotal / 9;
        const totalAmount = subtotal + taxrate + 40;
        return totalAmount.toFixed(2);
    }

    const taxAmount = () => {
        const taxAmount = subtotal / 9;
        return taxAmount.toFixed(3);
    }

    const onApprove = async (data) => {
        try {
            if (!data || !data.paymentId) {
                throw new Error("Invalid payment data");
            }

            const payload = {
                data: {
                    paymentId: data.paymentId.toString(),
                    totalOrderAmount: totalAmounts,
                    username: username,
                    email: email,
                    phone: phone,
                    pincode: pincode,
                    address: address,
                    orderItemList: cartItemsList,
                    
                }
            };

            if (!payload.data.username || !payload.data.email || !payload.data.phone || !payload.data.pincode || !payload.data.address) {
                throw new Error("Missing required billing details");
            }

            const response = await GlobalApi.createOrder(payload, jwt);
            setOrderDetails(payload.data);
            setIsModalOpen(true);
            // cartItemsList.forEach((item,index)=>{
            //     GlobalApi.deleteCartItems(item.id).then(resp=>{
            //     })
            // })
            // router.replace('/order-confirmation');
        } catch (error) {
            console.error("Error placing order:", error);
            toast(`Error placing order: ${error.message}`);
        }
    }

    return (
        <div>
            <h2 className='p-3 bg-primary text-xl font-bold text-center text-white'>Checkout</h2>
            <div className='p-5 px-5 md:px-10 grid grid-cols-1 md:grid-cols-3 py-8'>
                <div className='md:col-span-2 mx-20'>
                    <h2 className='font-bold text-3xl'>Billing Details</h2>
                    <div className='grid grid-cols-2 gap-10 mt-3'>
                        <Input placeholder='Name' value={username} onChange={(e) => setUsername(e.target.value)} />
                        <Input placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className='grid grid-cols-2 gap-10 mt-3'>
                        <Input placeholder='Phone No.' value={phone} onChange={(e) => setPhone(e.target.value)} />
                        <Input placeholder='Pin Code' value={pincode} onChange={(e) => setPincode(e.target.value)} />
                    </div>
                    <div className='mt-3'>
                        <Input placeholder='Address' value={address} onChange={(e) => setAddress(e.target.value)} />
                    </div>
                </div>
                <div className='mx-10 border'>
                    <h2 className='p-3 bg-gray-200 font-bold text-center'>Total Cart ({totalCardItem})</h2>
                    <div>
                        <h2 className='p-2 font-bold flex justify-between'>SubTotal : <span>{subtotal} Rs</span></h2>
                        <hr />
                        <h2 className='p-2 flex justify-between'>Delivery : <span>40 Rs</span></h2>
                        <h2 className='p-2 flex justify-between'>Tax(9%) : <span>{taxAmount()} Rs</span></h2>
                        <hr />
                        <h2 className='p-2 font-bold flex justify-between'>Total : <span>{CalculateTotalAmount()} Rs</span></h2>
                        <Button className='flex items-center absolute sm:w-[100px] md:w-[300px] lg:w-[430px] mt-2' onClick={() => onApprove({ paymentId: 123 })}>Payment <ArrowBigRight /> </Button>
                    </div>
                </div>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} orderDetails={orderDetails} />
        </div>
    )
}

export default CheckOut;
