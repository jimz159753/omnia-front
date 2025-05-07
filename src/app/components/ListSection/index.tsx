import { MenuList } from '@mui/material'
import React from 'react'
import ItemSection from './ItemSection';
import { IMenuItem } from '../../constants';

interface ListSectionProps {
    items: IMenuItem[];
}

const ListSection = ({ items }: ListSectionProps) => {
  return (
    <MenuList>
      {items.map((item, index) => <ItemSection key={index} icon={item.icon} title={item.title} />)}
    </MenuList>
  )
}

export default ListSection;