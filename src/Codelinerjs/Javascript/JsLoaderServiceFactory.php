<?php
/**
 * Jsloader factory
 *
 * @copyright Copyright (c) 2012 codeliner
 * @license   New BSD License
 * @package   Jsloader
 */
namespace Codelinerjs\Javascript;

/**
 * JsLoaderServiceFactory
 *
 * @package    Jsloader
 */
class JsLoaderServiceFactory extends AbstractLoaderServiceFactory
{
    protected function getName()
    {
        return "default";
    }
}
