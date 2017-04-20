import React from 'react';
import ReactDOM from 'react-dom';
import ol from 'openlayers';
import {addLocaleData, IntlProvider} from 'react-intl';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MapPanel from 'boundless-sdk/components/MapPanel';
import LayerList from 'boundless-sdk/components/LayerList';
import Geocoding from 'boundless-sdk/components/Geocoding';
import GeocodingResults from 'boundless-sdk/components/GeocodingResults';
import Navigation from 'boundless-sdk/components/Navigation';
import Select from 'boundless-sdk/components/Select';
import QueryBuilder from 'boundless-sdk/components/QueryBuilder';
import FeatureTable from 'boundless-sdk/components/FeatureTable';
import Chart from 'boundless-sdk/components/Chart';
import MapConfig from 'boundless-sdk/components/MapConfig';
import {Toolbar, ToolbarGroup} from 'material-ui/Toolbar';
import Button from 'boundless-sdk/components/Button';
import TableIcon from 'material-ui/svg-icons/action/view-list';
import QueryIcon from 'material-ui/svg-icons/action/query-builder';
import ChartIcon from 'material-ui/svg-icons/editor/insert-chart';
import DrawFeature from 'boundless-sdk/components/DrawFeature';
import Globe from 'boundless-sdk/components/Globe';
import Zoom from 'boundless-sdk/components/Zoom';
import InfoPopup from 'boundless-sdk/components/InfoPopup';
import EditPopup from 'boundless-sdk/components/EditPopup';
import enLocaleData from 'react-intl/locale-data/en';
import injectTapEventPlugin from 'react-tap-event-plugin';
import enMessages from 'boundless-sdk/locale/en';

// Needed for onTouchTap
// Can go away when react 1.0 release
// Check this repo:
// https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

addLocaleData(
  enLocaleData
);

var styleTrees = new ol.style.Style({
  fill: new ol.style.Fill({
    color: 'rgba(186,221,105,0.505882)'
  })
});

var styleAirports = new ol.style.Style({
  image: new ol.style.Icon({
    scale: 0.025000,
    anchorOrigin: 'top-left',
    anchorXUnits: 'fraction',
    anchorYUnits: 'fraction',
    anchor: [0.5, 0.5],
    src: './data/styles/plane.svg'
  })
});

var baseStylePopp = [new ol.style.Style({
  image: new ol.style.Circle({
    radius: 7.0,
    stroke: new ol.style.Stroke({
      color: 'rgba(0,0,0,255)',
      lineDash: null,
      width: 1
    }),
    fill: new ol.style.Fill({
      color: 'rgba(255,255,255,1.0)'
    })
  })
}), new ol.style.Style({
  image: new ol.style.Circle({
    radius: 1.0,
    stroke: new ol.style.Stroke({
      color: 'rgba(0,0,0,255)',
      lineDash: null,
      width: 1
    }),
    fill: new ol.style.Fill({
      color: 'rgba(0,0,0,1.0)'
    })
  })
})];

var clusterStyleCachePopp = {};
var stylePopp = function(feature) {
  var style;
  var features = feature.get('features');
  var size = 0;
  for (var i = 0, ii = features.length; i < ii; ++i) {
    if (features[i].selected) {
      return null;
    }
    if (features[i].hide !== true) {
      size++;
    }
  }
  if (size === 0) {
    return null;
  }
  if (size !== 1) {
    style = clusterStyleCachePopp[size];
    if (!style) {
      style = new ol.style.Style({
        image: new ol.style.Circle({
          radius: 10,
          stroke: new ol.style.Stroke({
            color: '#fff'
          }),
          fill: new ol.style.Fill({
            color: '#3399CC'
          })
        }),
        text: new ol.style.Text({
          text: size.toString(),
          fill: new ol.style.Fill({
            color: '#fff'
          })
        })
      });
      clusterStyleCachePopp[size] = style;
    }
    return style;
  } else {
    return baseStylePopp;
  }
};
var map = new ol.Map({
  controls: [],
  layers: [
    new ol.layer.Group({
      type: 'base-group',
      title: 'Base maps',
      layers: [
        new ol.layer.Tile({
          type: 'base',
          title: 'Streets',
          source: new ol.source.OSM()
        }),
        new ol.layer.Tile({
          type: 'base',
          title: 'Aerial',
          visible: false,
          source: new ol.source.XYZ({
            attributions: [
              new ol.Attribution({
                html: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              })
            ],
            url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          })
        })
      ]
    }),
    new ol.layer.Vector({
      id: 'lyr01',
      isSelectable: true,
      geometryType: 'Polygon',
      attributes: ['cat', 'VEGDESC', 'VEG_ID', 'F_CODEDESC', 'F_CODE', 'AREA_KM2'],
      title: 'trees',
      style: styleTrees,
      source: new ol.source.Vector({
        format: new ol.format.GeoJSON(),
        url: './data/trees.json'
      })
    }),
    new ol.layer.Vector({
      id: 'lyr02',
      isSelectable: true,
      geometryType: 'Point',
      attributes: ['cat', 'F_CODEDESC', 'F_CODE', 'TYPE'],
      title: 'popp',
      style: stylePopp,
      source: new ol.source.Cluster({
        source: new ol.source.Vector({
          format: new ol.format.GeoJSON(),
          url: './data/popp.json'
        })
      })
    }),
    new ol.layer.Vector({
      title: 'airports',
      id: 'lyr03',
      popupInfo: '<b>cat</b>: [cat]<br><b>NA3</b>: [NA3]<br><b>ELEV</b>: [ELEV]<br><b>F_CODE</b>: [F_CODE]<br><b>IKO</b>: [IKO]<br><b>NAME</b>: [NAME]<br><b>USE</b>: [USE]',
      isSelectable: true,
      geometryType: 'Point',
      attributes: ['cat', 'NA3', 'ELEV', 'F_CODE', 'IKO', 'NAME', 'USE'],
      style: styleAirports,
      source: new ol.source.Vector({
        format: new ol.format.GeoJSON(),
        url: './data/airports.json'
      })
    })
  ],
  view: new ol.View({
    center: [-16839563.5993915, 8850169.509638],
    zoom: 4
  })
});

var charts = [{
  title: 'Airports count per use category',
  categoryField: 'USE',
  layer: 'lyr03',
  valueFields: [],
  displayMode: 2,
  operation: 2
}, {
  title: 'Forest area total surface',
  categoryField: 'VEGDESC',
  layer: 'lyr01',
  valueFields: ['AREA_KM2'],
  displayMode: 1,
  operation: 2
}];

class BasicApp extends React.Component {
  getChildContext() {
    return {
      muiTheme: getMuiTheme()
    };
  }
  _toggle(el) {
    if (el.style.display === 'block') {
      el.style.display = 'none';
    } else {
      el.style.display = 'block';
    }
  }
  _toggleTable() {
    this._toggle(ReactDOM.findDOMNode(this.refs.tablePanel));
    this.refs.table.getWrappedInstance().setDimensionsOnState();
  }
  _toggleQuery() {
    this._toggle(ReactDOM.findDOMNode(this.refs.queryPanel));
  }
  _toggleChart() {
    this._toggle(ReactDOM.findDOMNode(this.refs.chartPanel));
  }
  render() {
    return (
      <div id='content'>
        <Toolbar>
          <MapConfig map={map}/>
          <ToolbarGroup><Button buttonType='Icon' tooltip='Table' onTouchTap={this._toggleTable.bind(this)}><TableIcon /></Button></ToolbarGroup>
          <ToolbarGroup><Button buttonType='Icon' tooltip='Query' onTouchTap={this._toggleQuery.bind(this)}><QueryIcon /></Button></ToolbarGroup>
          <ToolbarGroup><Button buttonType='Icon' tooltip='Chart' onTouchTap={this._toggleChart.bind(this)}><ChartIcon /></Button></ToolbarGroup>
          <ToolbarGroup><DrawFeature toggleGroup='navigation' map={map} /></ToolbarGroup>
          <ToolbarGroup><Select toggleGroup='navigation' map={map}/></ToolbarGroup>
          <ToolbarGroup><Navigation secondary={true} toggleGroup='navigation' map={map}/></ToolbarGroup>
          <ToolbarGroup>
            <Geocoding />
          </ToolbarGroup>
        </Toolbar>
        <MapPanel id='map' map={map}/>
        <div ref='queryPanel' className='query-panel'><QueryBuilder map={map} /></div>
        <div id='geocoding-results' className='geocoding-results-panel'><GeocodingResults map={map} /></div>
        <div id='globe-button'><Globe map={map} /></div>
        <div id='zoom-buttons'><Zoom map={map} /></div>
        <div id='layerlist'><LayerList allowFiltering={true} showOpacity={true} showDownload={true} showGroupContent={true} showZoomTo={true} allowReordering={true} map={map} /></div>
        <div ref='tablePanel' id='table-panel' className='attributes-table'><FeatureTable toggleGroup='navigation' ref='table' map={map} /></div>
        <div id='editpopup' className='ol-popup'><EditPopup toggleGroup='navigation' map={map} /></div>
        <div id='popup' className='ol-popup'><InfoPopup toggleGroup='navigation' map={map} /></div>
        <div ref='chartPanel' className='chart-panel'><Chart charts={charts} onClose={this._toggleChart.bind(this)}/></div>
      </div>
    );
  }
}

BasicApp.childContextTypes = {
  muiTheme: React.PropTypes.object
};

ReactDOM.render(<IntlProvider locale='en' messages={enMessages}><BasicApp /></IntlProvider>, document.getElementById('main'));
