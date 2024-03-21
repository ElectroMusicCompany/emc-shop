export const getItemImage = (id: string, format: string) => {
  return `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/ITEM_IMAGES/${id}.${format}`;
}

export const getAvatar = (id: string, avatar: string | null) => {
  return `https://cdn.discordapp.com/avatars/${id}/${avatar}.jpg?size=100`;
}
