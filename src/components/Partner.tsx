import React from 'react';
import { EditOutlined, EllipsisOutlined, SettingOutlined } from '@ant-design/icons';
import { Row, Col, Avatar, Card } from 'antd';

const { Meta } = Card;

const renderCard = () => {
  return (
    <Card
      style={{ width: 300 }}
      cover={
        <img
          alt="example"
          src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
        />
      }
    >
      <Meta
        avatar=''
        title=''
        description=''
      />
    </Card>
  )
}

const Partner = () => {
  return (
    <Row gutter={[24, 24]}>
      {
        new Array(4).fill(1).map(item => {
          return (
            <Col span={6}>
              {renderCard()}
            </Col>
          )
        })
      }
    </Row>
  )
}

export default Partner;