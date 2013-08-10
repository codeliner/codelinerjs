<?php
/**
 * Jsloader ViewHelper
 *
 * @author Alexander Miertsch kontakt@codeliner.ws
 * @package Jsloader
 * @subpackage View
 * @version 1.0
 */
namespace Codelinerjs\View\Helper;

use Zend\View\Helper\AbstractHelper;
use Zend\ServiceManager\ServiceManager;

class Jsloader extends AbstractHelper
{
    protected $serviceManager;

    public function setServiceManager(ServiceManager $serviceManager)
    {
        $this->serviceManager = $serviceManager;
    }

    /**
     * Returns the Javascript include from Jsloader
     *
     * This can be a script tag with a src located in a public path
     * or an inline script tag
     *
     * @return string
     */
    public function __invoke ($jsloaderInstance = "codelinerjs.js_loader") {
        try{
            return $this->serviceManager->get($jsloaderInstance)->getLoader();
        } catch (\Exception $e) {
            return $e->getMessage();
        }
    }
}
