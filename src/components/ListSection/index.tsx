import { List } from '@mui/material'
import React from 'react'
import ItemSection from './ItemSection';

interface ListSectionProps {
    items: Array<{
        icon: React.ReactNode;
        title: string;
    }>
}

const ListSection = ({ items }: ListSectionProps) => {
  return (
    <List>
      {items.map((item, index) => <ItemSection key={index} icon={item.icon} title={item.title} />)}
    </List>
  )
}

export default ListSection;