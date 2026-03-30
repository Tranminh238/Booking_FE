import React from 'react';

const HotelCard = ({room, index}) => {
    return (
        <Link to={'/room' + room_id} onClick={() => scrollTo(0, 0)} key={room_id}>
            <img src={room.image} alt="" />
            <p className='px-3 py-1 absolute top-3 left-3 text-xs bg-white text-gray-800 font-medium round-full'>Best Seller</p>
            <div className='p-4 pt-5'>
                <div className='flexitems-center justify-between'>
                    <p className='font-playfair text-xl font-medium text-gray-800'>
                        {room.name}
                    </p>
                    <div className='flex items-center gap-1'>
                        <img src={star_icon} alt="" />
                        <p>{room.rating}</p>
                    </div>  
                </div>
            </div>
        </Link>
    );
};

export default HotelCard;
