export const getRoomsByHotelId = async (hotelId) => {
  try {
    const res = await fetch(`http://localhost:8889/api/room/hotel/${hotelId}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching rooms: ", error);
    throw error;
  }
};
