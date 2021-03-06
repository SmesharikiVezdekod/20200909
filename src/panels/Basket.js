import React, { useMemo, useState } from 'react';
import { withRouter, Link } from 'react-router-dom';
import accounting from 'accounting';

import Checkbox from './Checkbox';

import edit from '../img/edit.svg';
import './place.css';


const Basket = ({ match: { params: { areaId, itemId }}, foodAreas, order }) => {

  const fasterKey = "faster_" + itemId
  const timeKey = "time_" + itemId
  const selfServiceKey = "selfService_" + itemId

  const [ faster, setFaster ] = useState(JSON.parse(localStorage.getItem(fasterKey) || true));
  const [ time, setTime ] = useState(JSON.parse(localStorage.getItem(timeKey)) || '');
  const [ selfService, setSelfService ] = useState(JSON.parse(localStorage.getItem(selfServiceKey)) || false);
  const area = foodAreas.filter(area => area.id === areaId)[0];
  const item = area.items.filter(item => item.id === itemId)[0];

  const [ price, products ] = useMemo(() => {
    const foodIds = new Set((item.foods || []).map(item => item.id));

    const products = Object.values(order)
      .filter((value) => {
        const { item: { id }} = value;

        return foodIds.has(id);
      });

    const result = products.reduce((result, value) => {
        const { count, item } = value;

        return result + parseInt(item.price) * parseInt(count);
      }, 0);

    return [ accounting.formatNumber(result, 0, ' '), products ];
  }, [ order, item ]);

    function checkCanPay(event) {
        const foodIds = new Set((item.foods || []).map(item => item.id));

        const placeFoods = Object.values(order)
            .filter((value) => {
                const { item: { id }} = value;
                return foodIds.has(id);
            })

        if (!placeFoods.some(el => { return  el.count > 0 })) event.preventDefault()
    }

  return (
    <div className="Place">
      <header className="Place__header">
        <aside className="Place__trz">
          <h1 className="Place__head">
            <Link to="/" className="Place__logo">
              {area.name}
            </Link>
          </h1>
          <Link to="/edit" className="Place__change-tz">
            <img
              alt="change-profile"
              src={edit}
            />
          </Link>
        </aside>
      </header>
      <aside className="Place__restoraunt">
        <img
          className="Place__restoraunt-logo"
          alt="Fastfood logo"
          src={item.image}
        />
        <h2
          className="Place__restoraunt-name"
        >
          {item.name}
        </h2>
        <p className="Place__restoraunt-type">
          {item.description}
        </p>
      </aside>
      <div className="Place__products-wrapper">
        <ul className="Place__products">
          {products.map(({ item, count }) => (
            <li
              className="Place__product"
              key={item.id}
            >
              <img
                className="Place__product-logo"
                alt="Ordered product logo"
                src={item.image}
              />
              <h3
                className="Place__product-name"
              >
                {item.name}
              </h3>
              <p
                className="Place__product-price"
              >
                Цена: {item.price}
              </p>
              <p
                className="Place__product-count"
              >
                x{count}
              </p>
            </li>
          ))}
        </ul>
        <Link
          className="Place__change-product"
          to={`/place/${areaId}/${itemId}`}
        >
          Изменить
        </Link>
      </div>
      <div className="Place__choice">
        <h3>Время:</h3>
        <div className="Place__choice-item">
          <span>Как можно быстрее</span>
          <Checkbox 
            checked={faster} 
            onToggle={() => {
                if (!time)
                    return

                localStorage.setItem(fasterKey, JSON.stringify(!faster))
                if (faster) {
                setFaster(false);
                } else {
                localStorage.setItem(timeKey, JSON.stringify(''))
                setTime('');
                setFaster(true);
                }
            }}
          />
        </div>
        <div className="Place__choice-item">
          <span>Назначить</span>
          <input
            type="time"
            value={time}
            onChange={event => {
                const newValue = event.target.value

                if (newValue) {
                    setFaster(false);
                    setTime(newValue);
                    localStorage.setItem(fasterKey, JSON.stringify(false))
                    localStorage.setItem(timeKey, JSON.stringify(newValue))
                } else {
                    setFaster(true);
                    setTime(newValue);
                    localStorage.setItem(fasterKey, JSON.stringify(true))
                    localStorage.setItem(timeKey, JSON.stringify(newValue))
                }
            }}
            onBlur={() => {
              if (time) {
                setFaster(false);
                localStorage.setItem(fasterKey, JSON.stringify(false))
              }
            }}
          />
        </div>
        <div className="Place__choice-item">
          <h3>С собой</h3>
          <Checkbox checked={selfService} onToggle={() => {
            localStorage.setItem(selfServiceKey, JSON.stringify(!selfService))
            setSelfService(!selfService)
          }} />
        </div>
        <div className="Place__choice-item">
          <h3>На месте</h3>
          <Checkbox checked={!selfService} onToggle={() => {
            localStorage.setItem(selfServiceKey, JSON.stringify(!selfService))
            setSelfService(!selfService)
          }} />
        </div>
      </div>
      <footer className="Place__footer">
        <Link to={`/order/${area.id}/${item.id}`} className="Place__order" onClick={ (e) => checkCanPay(e) }>
          Оплатить {price}
        </Link>
      </footer>
    </div>
  );
};

export default withRouter(Basket);
